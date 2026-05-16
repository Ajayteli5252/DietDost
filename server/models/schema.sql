-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255),
  age INT,
  gender ENUM('male', 'female', 'other'),
  state VARCHAR(50),
  google_id VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP table
CREATE TABLE otp_verification (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE user_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  height FLOAT,
  weight FLOAT,
  goal ENUM('fat_loss','muscle_gain','maintain','general_health'),
  activity_level ENUM('sedentary','lightly_active','moderately_active','very_active'),
  diet_type ENUM('vegetarian','non_vegetarian','eggetarian','vegan'),
  workout_type ENUM('no_gym','home_workout','gym_beginner','gym_intermediate','gym_advanced'),
  daily_calorie_target FLOAT,
  protein_target FLOAT,
  carbs_target FLOAT,
  fat_target FLOAT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Food logs table
CREATE TABLE food_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  meal_type ENUM('breakfast','lunch','dinner','snacks') NOT NULL,
  food_description TEXT NOT NULL,
  calories FLOAT,
  protein FLOAT,
  carbs FLOAT,
  fat FLOAT,
  log_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Activity logs table
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  steps INT DEFAULT 0,
  exercise_type VARCHAR(100),
  duration_minutes INT,
  calories_burned FLOAT,
  log_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Water intake table
CREATE TABLE water_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  glasses INT DEFAULT 0,
  log_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AI suggestions table
CREATE TABLE ai_suggestions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  suggestion TEXT NOT NULL,
  suggestion_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- weight logs table
CREATE TABLE IF NOT EXISTS weight_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  weight FLOAT NOT NULL,
  note VARCHAR(255),
  log_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- streaks table

CREATE TABLE streaks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_log_date DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- notifications table

CREATE TABLE notification_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  meal_reminder BOOLEAN DEFAULT true,
  water_reminder BOOLEAN DEFAULT true,
  streak_reminder BOOLEAN DEFAULT true,
  reminder_time VARCHAR(5) DEFAULT '08:00',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type VARCHAR(50), -- 'streak', 'goal', 'badge', 'system'
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);