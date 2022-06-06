CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(512) DEFAULT NULL,
  `email` varchar(512) DEFAULT NULL,
  `password` varchar(512) DEFAULT NULL,
  `first_name` varchar(512) DEFAULT NULL,
  `last_name` varchar(512) DEFAULT NULL,
  `sso_id` varchar(512) DEFAULT NULL,
  `action_token` varchar(512) DEFAULT NULL,
  `last_password_change` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  `past_passwords_hash` text DEFAULT NULL,
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `auth_user_tag_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `path` varchar(512) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `record_id_fk` (`record_id`),
  CONSTRAINT `record_id_fk` FOREIGN KEY (`record_id`) REFERENCES `auth_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `py4web_session` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rkey` varchar(512) DEFAULT NULL,
  `rvalue` text,
  `expiration` int(11) DEFAULT NULL,
  `created_on` datetime DEFAULT NULL,
  `expires_on` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rkey__idx` (`rkey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(512),
  `color` varchar(512),
  `uses` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(512) NOT NULL,
  `body` text NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_on` datetime,
  `image_url` varchar(512),
  `tag1` int(11),
  `tag2` int(11),
  `tag3` int(11),
  `lat` double,
  `lng` double,
  `inverse_max_freq` double DEFAULT 1.0,
  PRIMARY KEY (`id`),
  CONSTRAINT `cb_fk` FOREIGN KEY (`created_by`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `t1_fk` FOREIGN KEY (`tag1`) REFERENCES `tags` (`id`),
  CONSTRAINT `t2_fk` FOREIGN KEY (`tag2`) REFERENCES `tags` (`id`),
  CONSTRAINT `t3_fk` FOREIGN KEY (`tag3`) REFERENCES `tags` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `terms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `term` varchar(13) NOT NULL,
  `doc_freq` double,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `term_freq` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post` int(11),
  `term` int(11),
  `post_freq` double,
  PRIMARY KEY (`id`),
  CONSTRAINT `p_fk` FOREIGN KEY (`post`) REFERENCES `posts` (`id`),
  CONSTRAINT `t_fk` FOREIGN KEY (`term`) REFERENCES `terms` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `rating` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post` int(11),
  `user` int(11),
  PRIMARY KEY (`id`),
  CONSTRAINT `pr_fk` FOREIGN KEY (`post`) REFERENCES `posts` (`id`),
  CONSTRAINT `ur_fk` FOREIGN KEY (`user`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
