import { ApiProperty } from '@nestjs/swagger';
export class InviteMembersToGuildDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  members: Array<number>;
}
