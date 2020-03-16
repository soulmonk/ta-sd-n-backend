CREATE USER test NOSUPERUSER;
ALTER USER test WITH PASSWORD 'toor';

CREATE DATABASE "ta-sd-n-backend-main" WITH OWNER 'test';
CREATE DATABASE "ta-sd-n-backend-auth" WITH OWNER 'test';
