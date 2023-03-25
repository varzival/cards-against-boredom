import { MigrationInterface, QueryRunner } from "typeorm";

export class HandOfCards1679659940058 implements MigrationInterface {
    name = 'HandOfCards1679659940058'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "hand_of_cards" ("userId" uuid NOT NULL, "cardId" uuid NOT NULL, "order" integer, CONSTRAINT "PK_8ce8ef5113d176681d47ad86bfc" PRIMARY KEY ("userId", "cardId"))`);
        await queryRunner.query(`ALTER TABLE "hand_of_cards" ADD CONSTRAINT "FK_40415c96935efe90829d8778716" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hand_of_cards" ADD CONSTRAINT "FK_08ecdfa24e6d95061e9f0ffdee0" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hand_of_cards" DROP CONSTRAINT "FK_08ecdfa24e6d95061e9f0ffdee0"`);
        await queryRunner.query(`ALTER TABLE "hand_of_cards" DROP CONSTRAINT "FK_40415c96935efe90829d8778716"`);
        await queryRunner.query(`DROP TABLE "hand_of_cards"`);
    }

}
