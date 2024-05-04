-- CREATE TABLE `pokeDiscord`.`trade` (
--     `id` INT NOT NULL AUTO_INCREMENT,
--     `idTrainer` VARCHAR(50) COLLATE utf8mb4_general_ci NOT NULL,
--     `idPokemonPropose` INT NOT NULL,
--     `idPokemonRequest` INT NOT NULL,
--     `quantityPokemonPropose` INT NOT NULL,
--     `quantityPokemonRequest` INT NOT NULL,
--     `isAccept` TINYINT NOT NULL DEFAULT '1',
--     PRIMARY KEY (`id`),
--     FOREIGN KEY (`idTrainer`) REFERENCES `trainer`(`idDiscord`),
--     FOREIGN KEY (`idPokemonPropose`) REFERENCES `pokemon`(`id`),
--     FOREIGN KEY (`idPokemonRequest`) REFERENCES `pokemon`(`id`)
-- ) ENGINE = InnoDB;

-- CREATE TABLE `rune_trainer` (
--   `id` int NOT NULL,
--   `idPokemon` int NOT NULL,
--   `idTrainer` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
--   `quantity` int NOT NULL,
--   `isShiny` tinyint(1) NOT NULL
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ALTER TABLE `rune_trainer`
--   ADD PRIMARY KEY (`id`),
--   ADD UNIQUE KEY `idPokemon` (`idPokemon`,`idTrainer`,`isShiny`),
--   ADD KEY `fk_rune_trainer_idTrainer` (`idTrainer`);

-- ALTER TABLE `rune_trainer`
--   MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

-- ALTER TABLE `rune_trainer`
--   ADD CONSTRAINT `fk_rune_trainer_idPokemon` FOREIGN KEY (`idPokemon`) REFERENCES `pokemon` (`id`),
--   ADD CONSTRAINT `fk_rune_trainer_idTrainer` FOREIGN KEY (`idTrainer`) REFERENCES `trainer` (`idDiscord`);

-- ALTER TABLE `trade`
--   ADD FOREIGN KEY (`idTrainer`) REFERENCES `trainer`(`idDiscord`),
--   ADD FOREIGN KEY (`idPokemonPropose`) REFERENCES `pokemon`(`id`),
--   ADD FOREIGN KEY (`idPokemonRequest`) REFERENCES `pokemon`(`id`);

-- ALTER TABLE `pokemon_wild` ADD `isShiny` TINYINT(1) NOT NULL DEFAULT '0' AFTER `catchCode`;
-- ALTER TABLE `pokemon` CHANGE `shinyRate` `shinyRate` SMALLINT UNSIGNED NULL DEFAULT NULL;
-- ALTER TABLE `pokemon` ADD `shinyRate` TINYINT(3) UNSIGNED NULL DEFAULT NULL AFTER `sellPrice`;
-- ALTER TABLE `pokemon` ADD `imgShiny` VARCHAR(255) NOT NULL AFTER `img`;
-- UPDATE pokemon
-- SET imgShiny = REPLACE(img, 'regular.png', 'shiny.png')
-- WHERE img IS NOT NULL;
-- ALTER TABLE `rune_trainer` DROP `isShiny`

-- ALTER TABLE `trade` ADD `isShinyPropose` TINYINT NOT NULL AFTER `quantityPokemonRequest`, ADD `isShinyRequest` TINYINT NOT NULL AFTER `isShinyPropose`;

CREATE TABLE `tutorial_command_trainer` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `idTrainer` VARCHAR(50) NOT NULL ,
  `commandName` VARCHAR(100) NOT NULL ,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

ALTER TABLE `tutorial_command_trainer` CHANGE `idTrainer` `idTrainer` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;
ALTER TABLE `tutorial_command_trainer` CHANGE `commandName` `commandName` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;

ALTER TABLE `tutorial_command_trainer`
  ADD FOREIGN KEY (`idTrainer`) REFERENCES `trainer`(`idDiscord`);
