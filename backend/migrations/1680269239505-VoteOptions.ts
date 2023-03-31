import { MigrationInterface, QueryRunner } from "typeorm";

export class VoteOptions1680269239505 implements MigrationInterface {
    name = 'VoteOptions1680269239505'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "voteOrder" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "votedFor" integer`);
        await queryRunner.query(`ALTER TABLE "hand_of_cards" DROP COLUMN "selected"`);
        await queryRunner.query(`ALTER TABLE "hand_of_cards" ADD "selected" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hand_of_cards" DROP COLUMN "selected"`);
        await queryRunner.query(`ALTER TABLE "hand_of_cards" ADD "selected" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "votedFor"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "voteOrder"`);
    }

}
