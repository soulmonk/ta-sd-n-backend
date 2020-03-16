create table "training_session"
(
    id          serial       not null
        constraint training_session_pk
            primary key,
    title       varchar(64)  not null,
    description varchar(256) not null,
    done        boolean      not null default false
);

create table "training_plan"
(
    training_session_id integer   not null
        constraint training_session_tsid_fkey
            references training_session
            on update cascade,
    priority integer
);
