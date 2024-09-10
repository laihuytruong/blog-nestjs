import { MigrationInterface, QueryRunner } from "typeorm";

export class SetDefaltValueReftoken1725961681095 implements MigrationInterface {
    name = 'SetDefaltValueReftoken1725961681095'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`refreshToken\` \`refreshToken\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`refreshToken\` \`refreshToken\` varchar(255) NOT NULL`);
    }

}
