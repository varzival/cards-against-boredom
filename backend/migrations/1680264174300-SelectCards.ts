import { MigrationInterface, QueryRunner } from "typeorm";

export class SelectCards1680264174300 implements MigrationInterface {
    name = 'SelectCards1680264174300'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hand_of_cards" ADD "selected" boolean NOT NULL DEFAULT 'false'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hand_of_cards" DROP COLUMN "selected"`);
    }

}
