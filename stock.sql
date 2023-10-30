CREATE TABLE `pokeDiscord`.`trade` ( `id` INT NOT NULL AUTO_INCREMENT , `idTrainer` INT NOT NULL , `idPokemonPropose` INT NOT NULL , `IdPokemonRequest` INT NOT NULL , `quantityPokemonPropose` INT NOT NULL , `quantityPokemonRequest` INT NOT NULL , `isAccept` TINYINT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;

ALTER TABLE trade
ADD FOREIGN KEY (idTrainer) REFERENCES trainer(id);

ALTER TABLE trade
ADD FOREIGN KEY (idPokemonPropose) REFERENCES pokemon(id);

ALTER TABLE trade
ADD FOREIGN KEY (IdPokemonRequest) REFERENCES pokemon(id);

ALTER TABLE `trade` CHANGE `isAccept` `isAccept` TINYINT NOT NULL DEFAULT '1';