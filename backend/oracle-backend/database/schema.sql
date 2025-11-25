-- Users Table
CREATE TABLE users (
  user_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR2(100) NOT NULL,
  email VARCHAR2(100) NOT NULL UNIQUE,
  password VARCHAR2(100) NOT NULL,
  phone VARCHAR2(20),
  role VARCHAR2(20) NOT NULL CHECK (role IN ('seeker', 'provider', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
  category_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR2(100) NOT NULL UNIQUE,
  description VARCHAR2(500)
);

-- Services Table
CREATE TABLE services (
  service_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR2(100) NOT NULL,
  description VARCHAR2(1000) NOT NULL,
  price NUMBER(10,2) NOT NULL,
  duration_minutes NUMBER NOT NULL,
  is_available NUMBER(1) DEFAULT 1 CHECK (is_available IN (0, 1)),
  provider_id NUMBER NOT NULL,
  category_id NUMBER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location  VARCHAR2(255),
  FOREIGN KEY (provider_id) REFERENCES users(user_id),
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Bookings Table
CREATE TABLE bookings (
  booking_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id NUMBER NOT NULL,
  service_id NUMBER NOT NULL,
  booking_date TIMESTAMP NOT NULL,
  status VARCHAR2(20) NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes VARCHAR2(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (service_id) REFERENCES services(service_id)
);

-- Reviews Table
CREATE TABLE reviews (
  review_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id NUMBER NOT NULL UNIQUE,
  rating NUMBER(2,1) NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment VARCHAR2(500),
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- Complaints Table
CREATE TABLE complaints (
  complaint_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id NUMBER NOT NULL,
  user_id NUMBER NOT NULL,
  description VARCHAR2(1000) NOT NULL,
  status VARCHAR2(20) NOT NULL CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Insert some sample categories
INSERT INTO categories (name, description) VALUES ('Plumbing', 'Plumbing services including repairs and installations');
INSERT INTO categories (name, description) VALUES ('Electrical', 'Electrical services including wiring and repairs');
INSERT INTO categories (name, description) VALUES ('Cleaning', 'Home and office cleaning services');
INSERT INTO categories (name, description) VALUES ('Carpentry', 'Woodworking and furniture repair services');
INSERT INTO categories (name, description) VALUES ('Painting', 'Interior and exterior painting services');
COMMIT;