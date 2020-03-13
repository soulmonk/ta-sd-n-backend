create table "user"
(
    id         serial not null
        constraint user_pk
            primary key,
    name       varchar(64), -- todo unique
    email      varchar(256),
    password   varchar(256),
    created_at timestamp default now(),
    updated_at timestamp default now()
);
