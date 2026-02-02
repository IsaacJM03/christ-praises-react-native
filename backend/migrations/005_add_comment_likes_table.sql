-- Comment likes table
CREATE TABLE IF NOT EXISTS comment_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES post_comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_comment_like (comment_id, user_id)
);

-- Add replies_count to post_comments if not exists
ALTER TABLE post_comments ADD COLUMN replies_count INT DEFAULT 0;

-- Add is_liked tracking
ALTER TABLE post_comments ADD COLUMN likes_count INT DEFAULT 0;
