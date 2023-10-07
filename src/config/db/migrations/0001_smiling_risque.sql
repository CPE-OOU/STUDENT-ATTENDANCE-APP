DO $$ BEGIN
 CREATE TYPE "account_type" AS ENUM('student', 'teacher');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
