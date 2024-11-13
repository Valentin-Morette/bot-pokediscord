ALTER TABLE `zone` ADD `generation` SMALLINT NOT NULL DEFAULT '1' AFTER `name`;

-- Export Zone Generation 2

-- Export Pokémon Generation 2

-- Export Pokemon-Zone Generation 2

UPDATE `pokemon` SET `idEvolution` = '169' WHERE `pokemon`.`id` = 42;
UPDATE `pokemon` SET `numberEvolution` = '32' WHERE `pokemon`.`id` = 42;
UPDATE `pokemon` SET `numberEvolution` = '1' WHERE `pokemon`.`id` = 45;
UPDATE `pokemon` SET `idEvolution` = '182' WHERE `pokemon`.`id` = 45;
UPDATE `pokemon` SET `idEvolution` = '186' WHERE `pokemon`.`id` = 62;
UPDATE `pokemon` SET `numberEvolution` = '1' WHERE `pokemon`.`id` = 62;
UPDATE `pokemon` SET `numberEvolution` = '2' WHERE `pokemon`.`id` = 80;
UPDATE `pokemon` SET `idEvolution` = '199' WHERE `pokemon`.`id` = 80;
UPDATE `pokemon` SET `numberEvolution` = '10' WHERE `pokemon`.`id` = 95;
UPDATE `pokemon` SET `idEvolution` = '208' WHERE `pokemon`.`id` = 95;
UPDATE `pokemon` SET `idEvolution` = '212' WHERE `pokemon`.`id` = 123;
UPDATE `pokemon` SET `numberEvolution` = '3' WHERE `pokemon`.`id` = 123;
UPDATE `pokemon` SET `numberEvolution` = '3' WHERE `pokemon`.`id` = 117;
UPDATE `pokemon` SET `sellPrice` = '5000' WHERE `pokemon`.`id` = 137;
UPDATE `pokemon` SET `numberEvolution` = '2' WHERE `pokemon`.`id` = 137;
UPDATE `pokemon` SET `idEvolution` = '233' WHERE `pokemon`.`id` = 137;
UPDATE `pokemon` SET `idEvolution` = '237' WHERE `pokemon`.`id` = 107;
UPDATE `pokemon` SET `numberEvolution` = '10' WHERE `pokemon`.`id` = 107;
UPDATE `pokemon` SET `idEvolution` = '237' WHERE `pokemon`.`id` = 106;
UPDATE `pokemon` SET `numberEvolution` = '10' WHERE `pokemon`.`id` = 106;
UPDATE `pokemon` SET `idEvolution` = '242' WHERE `pokemon`.`id` = 113;
UPDATE `pokemon` SET `numberEvolution` = '3' WHERE `pokemon`.`id` = 113;
