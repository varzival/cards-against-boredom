import { MigrationInterface, QueryRunner } from "typeorm";

export class HandOfCardsOrder1679744590768 implements MigrationInterface {
  name = "HandOfCardsOrder1679744590768";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "hand_of_cards" DROP CONSTRAINT "PK_8ce8ef5113d176681d47ad86bfc"`
    );
    await queryRunner.query(
      `ALTER TABLE "hand_of_cards" ALTER COLUMN "order" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "hand_of_cards" ADD CONSTRAINT "PK_0e74267104018a4ed6e0b16d9fd" PRIMARY KEY ("userId", "cardId", "order")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "hand_of_cards" DROP CONSTRAINT "PK_0e74267104018a4ed6e0b16d9fd"`
    );
    await queryRunner.query(
      `ALTER TABLE "hand_of_cards" ADD CONSTRAINT "PK_8ce8ef5113d176681d47ad86bfc" PRIMARY KEY ("userId", "cardId")`
    );
    await queryRunner.query(
      `ALTER TABLE "hand_of_cards" ALTER COLUMN "order" DROP NOT NULL`
    );
  }
}
