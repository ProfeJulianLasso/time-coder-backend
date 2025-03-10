import { MigrationInterface, QueryRunner } from 'typeorm';

export class Inicio1741628601028 implements MigrationInterface {
  name = 'Inicio1741628601028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "activities" ("id" character varying(26) NOT NULL, "user_id" character varying NOT NULL, "project" character varying NOT NULL, "file" character varying NOT NULL, "language" character varying NOT NULL, "startTime" bigint NOT NULL, "endTime" bigint NOT NULL, "duration" double precision NOT NULL, "branch" character varying NOT NULL, "debug" boolean NOT NULL, "machine" character varying NOT NULL, "platform" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "activities_user_id_index" ON "activities" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "activities_project_index" ON "activities" ("project") `,
    );
    await queryRunner.query(
      `CREATE INDEX "activities_language_index" ON "activities" ("language") `,
    );
    await queryRunner.query(
      `CREATE INDEX "activities_start_time_index" ON "activities" ("startTime") `,
    );
    await queryRunner.query(
      `CREATE INDEX "activities_end_time_index" ON "activities" ("endTime") `,
    );
    await queryRunner.query(
      `CREATE INDEX "activities_branch_index" ON "activities" ("branch") `,
    );
    await queryRunner.query(
      `CREATE INDEX "activities_debug_index" ON "activities" ("debug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "activities_platform_index" ON "activities" ("platform") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" character varying(26) NOT NULL, "username" character varying NOT NULL, "api_key" character varying NOT NULL, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_16bfa631de67a4fafe7ce3f2fed" UNIQUE ("api_key"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD CONSTRAINT "FK_b82f1d8368dd5305ae7e7e664c2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activities" DROP CONSTRAINT "FK_b82f1d8368dd5305ae7e7e664c2"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP INDEX "public"."activities_platform_index"`);
    await queryRunner.query(`DROP INDEX "public"."activities_debug_index"`);
    await queryRunner.query(`DROP INDEX "public"."activities_branch_index"`);
    await queryRunner.query(`DROP INDEX "public"."activities_end_time_index"`);
    await queryRunner.query(
      `DROP INDEX "public"."activities_start_time_index"`,
    );
    await queryRunner.query(`DROP INDEX "public"."activities_language_index"`);
    await queryRunner.query(`DROP INDEX "public"."activities_project_index"`);
    await queryRunner.query(`DROP INDEX "public"."activities_user_id_index"`);
    await queryRunner.query(`DROP TABLE "activities"`);
  }
}
