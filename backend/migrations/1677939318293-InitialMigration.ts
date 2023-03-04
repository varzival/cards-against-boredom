import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1677939318293 implements MigrationInterface {
    name = 'InitialMigration1677939318293'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "card" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "text" character varying NOT NULL, CONSTRAINT "PK_9451069b6f1199730791a7f4ae4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "text" character varying NOT NULL, "num" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "deck_of_questions" ("gameId" uuid NOT NULL, "questionId" uuid NOT NULL, "order" integer, CONSTRAINT "PK_de8d2b7a9a4bc61d5d9403ca699" PRIMARY KEY ("gameId", "questionId"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "points" integer NOT NULL DEFAULT '0', "gameId" uuid, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."game_gamestate_enum" AS ENUM('SELECT_CARD', 'VOTE', 'SHOW_RESULTS')`);
        await queryRunner.query(`CREATE TABLE "game" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startedAt" TIMESTAMP WITH TIME ZONE, "gameState" "public"."game_gamestate_enum" NOT NULL DEFAULT 'SELECT_CARD', CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "deck_of_cards" ("gameId" uuid NOT NULL, "cardId" uuid NOT NULL, "order" integer, CONSTRAINT "PK_1f369bff84e506fb8664078d2ea" PRIMARY KEY ("gameId", "cardId"))`);
        await queryRunner.query(`ALTER TABLE "deck_of_questions" ADD CONSTRAINT "FK_8234750dc3ea94e2f32b9ba4a8a" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deck_of_questions" ADD CONSTRAINT "FK_1e8b2d8c80d65cee7cde5f7e421" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_fad52e091489708aa5665110f14" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deck_of_cards" ADD CONSTRAINT "FK_b3170c6304d02a7ec613aa846bb" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deck_of_cards" ADD CONSTRAINT "FK_b2fd1382ad721cb122c2787596e" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "deck_of_cards" DROP CONSTRAINT "FK_b2fd1382ad721cb122c2787596e"`);
        await queryRunner.query(`ALTER TABLE "deck_of_cards" DROP CONSTRAINT "FK_b3170c6304d02a7ec613aa846bb"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_fad52e091489708aa5665110f14"`);
        await queryRunner.query(`ALTER TABLE "deck_of_questions" DROP CONSTRAINT "FK_1e8b2d8c80d65cee7cde5f7e421"`);
        await queryRunner.query(`ALTER TABLE "deck_of_questions" DROP CONSTRAINT "FK_8234750dc3ea94e2f32b9ba4a8a"`);
        await queryRunner.query(`DROP TABLE "deck_of_cards"`);
        await queryRunner.query(`DROP TABLE "game"`);
        await queryRunner.query(`DROP TYPE "public"."game_gamestate_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "deck_of_questions"`);
        await queryRunner.query(`DROP TABLE "question"`);
        await queryRunner.query(`DROP TABLE "card"`);
    }

}
