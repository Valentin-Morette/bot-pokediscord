CREATE TABLE `pokeDiscord`.`trade` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `idTrainer` VARCHAR(50) COLLATE utf8mb4_general_ci NOT NULL,
    `idPokemonPropose` INT NOT NULL,
    `idPokemonRequest` INT NOT NULL,
    `quantityPokemonPropose` INT NOT NULL,
    `quantityPokemonRequest` INT NOT NULL,
    `isAccept` TINYINT NOT NULL DEFAULT '1',
    PRIMARY KEY (`id`),
    FOREIGN KEY (`idTrainer`) REFERENCES `trainer`(`idDiscord`),
    FOREIGN KEY (`idPokemonPropose`) REFERENCES `pokemon`(`id`),
    FOREIGN KEY (`idPokemonRequest`) REFERENCES `pokemon`(`id`)
) ENGINE = InnoDB;
