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
    rating numeric(3, 1) NOT NULL,
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

CREATE TABLE IF NOT EXISTS public.requests
(
    "reqID" serial NOT NULL,
    "user_userID" integer NOT NULL,
    "groups_groupID" integer NOT NULL,
    status character(20) NOT NULL,
    PRIMARY KEY ("reqID")
);

ALTER TABLE IF EXISTS public.reviews
    ADD FOREIGN KEY ("userID")
    REFERENCES public.app_users ("userID") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


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


ALTER TABLE IF EXISTS public.requests
    ADD FOREIGN KEY ("user_userID")
    REFERENCES public.app_users ("userID") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.requests
    ADD FOREIGN KEY ("groups_groupID")
    REFERENCES public.groups ("groupID") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE requests
	ADD CONSTRAINT chk_request_status
	CHECK (status IN ('pending','approved','rejected'));

END;