// controllers/video.controller.js
const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");


module.exports = {

    // ============================================
    // 1. DEFAULT VIDEO UPLOAD (Admin only)
    // ============================================
    uploadDefaultVideo: async (req, res) => {
        try {
            const videoFile = req.files?.video?.[0];
            const thumbFile = req.files?.thumbnail?.[0];
            const { name, description } = req.body;
            const uploaded_by = req.user.id;

            if (!videoFile) {
                return res.send({ message: "Video file is required" });
            }
            if (!name) {
                return res.send({ message: "name is required" });
            }

            console.log("FILES RECEIVED:", req.files);


            // 1. Upload video
            const videoUpload = await cloudinary.uploader.upload(videoFile.path, {
                resource_type: "video",
                folder: "lms/default_videos",
            });

            fs.unlink(videoFile.path, () => { });

            const videoUrl = videoUpload.secure_url;

            // 2. Upload thumbnail IF provided
            let thumbnailUrl = null;

            if (thumbFile) {
                const thumbUpload = await cloudinary.uploader.upload(thumbFile.path, {
                    resource_type: "image",
                    folder: "lms/default_thumbnails",
                });

                thumbnailUrl = thumbUpload.secure_url;

                fs.unlink(thumbFile.path, () => { });
            }

            // 3. Insert into DB
            const sql = `
            INSERT INTO videos 
                (name, url, thumbnail, description, is_default, uploaded_by)
            VALUES (?, ?, ?, ?, 1, ?)
        `;

            db.query(
                sql,
                [name, videoUrl, thumbnailUrl, description || "", uploaded_by],
                (err2, result) => {
                    if (err2) {
                        return res.send(err2);
                    }
                    else {
                        console.log("Default video upload result:", result);
                        return res.send({
                            message: "Default video uploaded successfully",
                            video_id: result.insertId,
                            url: videoUrl,
                            thumbnail: thumbnailUrl
                        });
                    }
                }
            );
        } catch (err) {
            console.log("Default video upload error:", err);
            return res.send({ message: "Internal server error" });
        }
    },


    // ============================================
    // 2. GET ALL DEFAULT VIDEOS
    // ============================================
    getDefaultVideos: (req, res) => {
        const sql = `SELECT * FROM videos WHERE is_default = 1 AND is_active = 1`;
        db.query(sql, (err, rows) => {
            if (err) {
                console.log("Get Default Videos Error:", err);
                return res.send(err);
            }

            return res.send(rows);
        });
    },

    // ============================================
    // 3. STUDENT VIDEOS (default + their course + batch)
    // ============================================
    getStudentVideos: (req, res) => {
        const user_id = req.user.id;

        const checkSql = `
        SELECT * FROM user_course_batch
        WHERE user_id = ?
    `;

        db.query(checkSql, [user_id], (err, rows) => {

            if (err) return res.send(err);

            // NOT ASSIGNED → only default videos
            if (rows.length === 0) {
                const defaultSql = `
  SELECT * FROM videos
  WHERE is_default = 1
  AND is_active = 1
`;


                db.query(defaultSql, (err2, vids) => {
                    if (err2) return res.send(err2);

                    return res.send({
                        assigned: false,
                        videos: vids
                    });
                });

                return;
            }

            const course_id = rows[0].course_id;
            const batch_id = rows[0].batch_id;

            // STRICT LOGIC: show only videos matching BOTH course + batch
            const fullSql = `
  SELECT * FROM videos
  WHERE is_active = 1
    AND (
      is_default = 1
      OR (course_id = ? AND batch_id = ?)
    )
`;


            db.query(fullSql, [course_id, batch_id], (err3, vids) => {
                if (err3) return res.send(err3);

                return res.send({
                    assigned: true,
                    course_id,
                    batch_id,
                    videos: vids
                });
            });

        });
    },

    // ============================================
    // 4. UPLOAD COURSE + BATCH VIDEO (Trainer + Admin)
    // ============================================
    uploadCourseVideo: async (req, res) => {
        try {
            console.log("Upload Request Body:", req.body);
            console.log("Upload Request Files:", req.files);

            const videoFile = req.files?.video?.[0];
            const thumbFile = req.files?.thumbnail?.[0];
            const { name, description, course_id, batch_id, videoUrl, thumbnailUrl } = req.body;
            const uploaded_by = req.user.id;

            if (!videoFile && !videoUrl) {
                return res.send({ message: "Video file or URL is required" });
            }
            if (!name || !course_id || !batch_id) {
                return res.send({
                    message: "name, course_id and batch_id are required"
                });
            }

            // Validate batch belongs to course
            const batchSql = `
            SELECT * FROM batches
            WHERE id = ? AND course_id = ? AND is_active = 1
        `;

            db.query(batchSql, [batch_id, course_id], async (err, rows) => {
                if (err) {
                    console.error("Batch validation error:", err);
                    return res.send(err);
                }

                if (rows.length === 0) {
                    if (videoFile) fs.unlink(videoFile.path, () => { });
                    if (thumbFile) fs.unlink(thumbFile.path, () => { });
                    return res.send({ message: "Invalid batch for this course" });
                }

                try {
                    let finalVideoUrl = videoUrl;
                    let finalThumbUrl = thumbnailUrl;

                    // Upload VIDEO to cloudinary if file exists
                    if (videoFile) {
                        const videoUpload = await cloudinary.uploader.upload(videoFile.path, {
                            resource_type: "video",
                            folder: "lms/course_videos"
                        });
                        // Remove temp video file
                        fs.unlink(videoFile.path, () => { });
                        finalVideoUrl = videoUpload.secure_url;
                    }

                    // Upload THUMBNAIL if file exists
                    if (thumbFile) {
                        const thumbUpload = await cloudinary.uploader.upload(thumbFile.path, {
                            resource_type: "image",
                            folder: "lms/video_thumbnails"
                        });
                        finalThumbUrl = thumbUpload.secure_url;
                        // remove temp thumb file
                        fs.unlink(thumbFile.path, () => { });
                    }

                    // Insert into DB
                    const insertSql = `
                    INSERT INTO videos 
                        (name, url, thumbnail, description, course_id, batch_id, uploaded_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                    db.query(insertSql, [
                        name,
                        finalVideoUrl,
                        finalThumbUrl,
                        description || "",
                        course_id,
                        batch_id,
                        uploaded_by
                    ],
                        (err3, result) => {
                            if (err3) {
                                console.log("Upload Course Video DB Error:", err3);
                                return res.send(err3);
                            }

                            return res.send({
                                message: "Video uploaded",
                                video_id: result.insertId,
                                course_id,
                                batch_id,
                                url: finalVideoUrl,
                                thumbnail: finalThumbUrl
                            });
                        });

                } catch (cloudErr) {
                    console.log("Cloudinary Upload Error:", cloudErr);
                    return res.send({ message: "Cloudinary upload failed" });
                }
            });
        } catch (error) {
            console.error("Critical Upload Error:", error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    },


    // ============================================
    // 5. TRAINER: GET VIDEOS OF THEIR COURSE + BATCH ONLY
    // ============================================
    getTrainerVideos: (req, res) => {

        const trainer_id = req.user.id;

        // FIRST: find trainer's assigned course + batch
        const sql = `
            SELECT * FROM user_course_batch
            WHERE user_id = ?
        `;

        db.query(sql, [trainer_id], (err, rows) => {

            if (err) return res.send(err);

            // Trainer not assigned → no videos (except default if you want)
            if (rows.length === 0) {
                return res.send({
                    assigned: false,
                    videos: []
                });
            }

            const course_id = rows[0].course_id;
            const batch_id = rows[0].batch_id;

            // STRICT LOGIC
            const videoSql = `
                SELECT * FROM videos
                WHERE 
                    (course_id = ? AND batch_id = ?)
                    OR uploaded_by = ?
            `;

            db.query(videoSql, [course_id, batch_id, trainer_id], (err2, vids) => {

                if (err2) return res.send(err2);

                return res.send({
                    assigned: true,
                    course_id,
                    batch_id,
                    videos: vids
                });
            });

        });
    },

    // ============================================
    // 1. ADMIN: GET ALL VIDEOS
    // ============================================
    getAllVideosAdmin: (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const countSql = `SELECT COUNT(*) as total FROM videos WHERE is_active = 1`;
        const sql = `
            SELECT v.*, u.name as uploaded_by_name, c.name as course_name, b.title as batch_title
            FROM videos v
            LEFT JOIN users u ON v.uploaded_by = u.id
            LEFT JOIN courses c ON v.course_id = c.id
            LEFT JOIN batches b ON v.batch_id = b.id
            WHERE v.is_active = 1
            ORDER BY v.id DESC
            LIMIT ? OFFSET ?
        `;

        db.query(countSql, (err, countResult) => {
            if (err) return res.send(err);
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            db.query(sql, [limit, offset], (err, rows) => {
                if (err) return res.send(err);

                return res.send({
                    total,
                    totalPages,
                    currentPage: page,
                    videos: rows
                });
            });
        });
    },

    // ============================================
    // 3. COURSE VIDEOS (ADMIN + TRAINER)
    // ============================================
    getVideosByCourse: (req, res) => {
        const course_id = req.params.course_id;

        const sql = `
            SELECT * FROM videos
            WHERE course_id = ?
            AND is_active = 1
            ORDER BY id DESC
        `;

        db.query(sql, [course_id], (err, rows) => {
            if (err) return res.send(err);

            return res.send({
                course_id,
                total: rows.length,
                videos: rows
            });
        });
    },

    // ============================================
    // 4. BATCH VIDEOS (ADMIN + TRAINER)
    // ============================================
    getVideosByBatch: (req, res) => {

        const batch_id = req.params.batch_id;

        const sql = `
  SELECT * FROM videos
  WHERE batch_id = ?
  AND is_active = 1
  ORDER BY id DESC
`;


        db.query(sql, [batch_id], (err, rows) => {
            if (err) return res.send(err);

            return res.send({
                batch_id,
                total: rows.length,
                videos: rows
            });
        });
    },

    // ============================================


    // ============================================
    // 6. SEARCH VIDEOS (ADMIN + TRAINER)
    // ============================================
    searchVideos: (req, res) => {

        const key = req.query.key;

        if (!key) {
            return res.send({ message: "Search key required" });
        }

        const sql = `
  SELECT * FROM videos
  WHERE is_active = 1
    AND (
      name LIKE ?
      OR description LIKE ?
    )
  ORDER BY id DESC
`;


        const value = "%" + key + "%";

        db.query(sql, [value, value], (err, rows) => {
            if (err) return res.send(err);

            return res.send({
                search: key,
                results: rows.length,
                videos: rows
            });
        });
    },

    // ============================================
    // 5. GET ONE VIDEO BY ID (Strict Access Control)
    // ============================================
    getVideoById: (req, res) => {

        const video_id = req.params.video_id;
        const role = req.user.role;
        const user_id = req.user.id;

        const sql = `
  SELECT * FROM videos
  WHERE id = ?
  AND is_active = 1
`;


        db.query(sql, [video_id], (err, rows) => {

            if (err) return res.send(err);
            if (rows.length === 0) {
                return res.send({ message: "Video not found" });
            }

            const video = rows[0];

            // =============================
            // ADMIN: FULL ACCESS
            // =============================
            if (role === "admin") {
                return res.send(video);
            }

            // =============================
            // STUDENT ACCESS CHECK
            // =============================
            if (role === "student") {

                // Student course + batch lookup
                const sSql = `
                SELECT * FROM user_course_batch
                WHERE user_id = ?
            `;

                return db.query(sSql, [user_id], (err2, sRows) => {

                    if (err2) return res.send(err2);

                    // If student NOT assigned → ONLY default allowed
                    if (sRows.length === 0) {
                        if (video.is_default === 1) {
                            return res.send(video);
                        }
                        return res.send({ message: "Access denied" });
                    }

                    const studentCourse = sRows[0].course_id;
                    const studentBatch = sRows[0].batch_id;

                    // Check strict access
                    if (
                        video.is_default === 1 ||
                        (video.course_id == studentCourse && video.batch_id == studentBatch)
                    ) {
                        return res.send(video);
                    }

                    return res.send({ message: "Access denied" });
                });
            }

            // =============================
            // TRAINER ACCESS CHECK
            // =============================
            if (role === "trainer") {

                const tSql = `
                SELECT * FROM user_course_batch
                WHERE user_id = ?
            `;

                return db.query(tSql, [user_id], (err3, tRows) => {

                    if (err3) return res.send(err3);

                    if (tRows.length === 0) {
                        return res.send({ message: "Access denied" });
                    }

                    const trainerCourse = tRows[0].course_id;
                    const trainerBatch = tRows[0].batch_id;

                    // Trainer can access:
                    //   1. videos from their course+batch
                    //   2. videos uploaded by them
                    if (
                        (video.course_id == trainerCourse && video.batch_id == trainerBatch) ||
                        video.uploaded_by == user_id ||
                        video.is_default === 1
                    ) {
                        return res.send(video);
                    }

                    return res.send({ message: "Access denied" });
                });
            }

        });
    },

    // ============================================
    // SOFT DELETE VIDEO (admin or uploader trainer)
    // ============================================
    deleteVideo: (req, res) => {

        const video_id = req.params.video_id;
        const role = req.user.role;
        const user_id = req.user.id;

        const sql = `SELECT * FROM videos WHERE id = ? AND is_active = 1`;

        db.query(sql, [video_id], (err, rows) => {
            if (err) return res.send(err);

            if (rows.length === 0) {
                return res.send({ message: "Video not found or already deleted" });
            }

            const video = rows[0];

            // TRAINER → can delete only their own uploads
            if (role === "trainer" && video.uploaded_by != user_id) {
                return res.send({ message: "Access denied" });
            }

            // SOFT DELETE (mark inactive)
            const delSql = `UPDATE videos SET is_active = 0 WHERE id = ?`;

            db.query(delSql, [video_id], (err2) => {
                if (err2) return res.send(err2);

                return res.send({
                    message: "Video moved to archive (soft deleted)",
                    video_id
                });
            });
        });
    },


    // ============================================
    // EDIT VIDEO (admin or owning trainer)
    // ============================================
    editVideo: (req, res) => {

        const video_id = req.params.video_id;
        const role = req.user.role;
        const user_id = req.user.id;

        const { name, description, course_id, batch_id } = req.body;

        const sql = `SELECT * FROM videos WHERE id = ?`;

        db.query(sql, [video_id], (err, rows) => {

            if (err) return res.send(err);
            if (rows.length === 0) {
                return res.send({ message: "Video not found" });
            }

            const video = rows[0];

            // TRAINER can update ONLY their own uploads
            if (role === "trainer" && video.uploaded_by != user_id) {
                return res.send({ message: "Access denied" });
            }

            // If course or batch changing → only admin allowed
            if (role === "trainer" && (course_id || batch_id)) {
                return res.send({
                    message: "Trainer cannot change course_id or batch_id"
                });
            }

            const updateSql = `
            UPDATE videos SET 
                name = ?,
                description = ?,
                course_id = COALESCE(?, course_id),
                batch_id = COALESCE(?, batch_id)
            WHERE id = ?
        `;

            db.query(updateSql,
                [name || video.name,
                description || video.description,
                course_id || null,
                batch_id || null,
                    video_id],
                (err2) => {
                    if (err2) return res.send(err2);

                    return res.send({
                        message: "Video updated successfully",
                        video_id
                    });
                }
            );
        });
    }

};
