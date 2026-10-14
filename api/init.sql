-- Database is automatically created from POSTGRES_DB environment variable
-- No need to create database manually since PostgreSQL container handles this

BEGIN;


CREATE TABLE IF NOT EXISTS public.app_users
(
    "userID" serial,
    username character varying(32) NOT NULL,
    email character varying(255) NOT NULL,
    password character(255) NOT NULL,
    PRIMARY KEY ("userID"),
    CONSTRAINT username UNIQUE (username),
    CONSTRAINT email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS public.favorites
(
    "userID" integer,
    "movieID" integer,
    PRIMARY KEY ("userID", "movieID")
);

CREATE TABLE IF NOT EXISTS public.reviews
(
    "revID" serial NOT NULL,
    "userID" integer NOT NULL,
    "movieID" integer NOT NULL,
    review character varying(500) NOT NULL,
    rating integer NOT NULL,
    "time" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY ("revID")
);

CREATE TABLE IF NOT EXISTS public.groups
(
    "groupID" serial,
    groupname character varying(32) NOT NULL,
    "ownerID" integer NOT NULL,
    PRIMARY KEY ("groupID"),
    CONSTRAINT groupname UNIQUE (groupname)
);

CREATE TABLE IF NOT EXISTS public.group_movies
(
    "groupID" integer,
    "movieID" integer,
    PRIMARY KEY ("movieID", "groupID")
);

CREATE TABLE IF NOT EXISTS public.members
(
    "user_userID" integer,
    "groups_groupID" integer,
    PRIMARY KEY ("user_userID", "groups_groupID")
);

CREATE TABLE IF NOT EXISTS public.group_requests 
(
    id SERIAL PRIMARY KEY,
    "user_userID" INT NOT NULL REFERENCES public.app_users("userID") ON DELETE CASCADE,
    "groups_groupID" INT NOT NULL REFERENCES public.groups("groupID") ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("user_userID", "groups_groupID")
);

ALTER TABLE IF EXISTS public.reviews
    ADD FOREIGN KEY ("userID")
    REFERENCES public.app_users ("userID")
    MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE public.reviews
    ADD CONSTRAINT chk_rating_range
    CHECK (rating >= 1 AND rating <= 5);


ALTER TABLE IF EXISTS public.groups
    ADD CONSTRAINT owner FOREIGN KEY ("ownerID")
    REFERENCES public.app_users ("userID") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.group_movies
    ADD FOREIGN KEY ("groupID")
    REFERENCES public.groups ("groupID") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.members
    ADD FOREIGN KEY ("user_userID")
    REFERENCES public.app_users ("userID") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.members
    ADD FOREIGN KEY ("groups_groupID")
    REFERENCES public.groups ("groupID") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE public.group_requests 
ADD CONSTRAINT unique_user_group_request 
UNIQUE ("user_userID", "groups_groupID");

END;