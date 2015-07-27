###

drop table if exists `datatypes`;

###

create table `datatypes`(
  pkey int not null primary key,

  v0 tinyint,
  v1 smallint,
  v2 mediumint,
  v3 int,
  v4 bigint,

  uv0 tinyint,
  uv1 smallint unsigned,
  uv2 mediumint unsigned,
  uv3 int unsigned,
  uv4 bigint unsigned,

  n1 decimal(5,2),
  n2 numeric(5,2),
  n3 float,
  n4 double,

  d1 date,
  d2 datetime,
  d3 timestamp,
  d4 time,
  d5 year(4),

  c1 char(100),
  c2 char,
  c3 national char(100),
  c4 varchar(100),
  c5 varchar(1),
  c6 varchar(100),
  c7 binary(1),
  c8 varbinary(2),

  b1 tinyblob,
  b2 blob,
  b3 blob(4),
  b4 mediumblob,
  b5 longblob,

  t1 tinytext,
  t2 text,
  t3 text(4),
  t4 mediumtext,
  t5 longtext,

  e enum('v1','v2'),
  s set('v1','v2')

);

###

drop table if exists `sales`;

###

create table `sales` (
  orderId int not null primary key auto_increment,
  email varchar(255) not null,
  total int not null
);
