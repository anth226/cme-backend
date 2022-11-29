import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
  Request,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Connection, Repository } from 'typeorm';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';

import {
  ResourcesMicroServiceMessages,
  FindFacilityMsReq,
  CreateFacilityMsReq,
  FindFacilitiesForVillageMsReq,
  RemoveFacilityMsReq,
  UpgradeFacilityMsReq,
} from 'apps/resources-ms/src/service-messages';

import { CreateFacilityDto } from './dto/create-facility.dto';
import { Facility } from './facility.entity';

@ApiBearerAuth()
@Controller('facilities')
export class FacilitiesController {
  private resourcesMSClient: ClientProxy;

  constructor(
    private connection: Connection,
    @InjectRepository(Facility)
    private facilitiesRepository: Repository<Facility>,
  ) {
    this.resourcesMSClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: 'resources-ms',
        port: 3004,
      },
    });
  }

  // Todo: add this request in the village controller as /villages/:id/facilities : it has nothing to do here
  // Check with the front if this route is needed and delete it when it's ok.
  @Get('village/:id')
  index(@Param('id') villageId: string) {
    const pattern = {
      cmd: ResourcesMicroServiceMessages.GET_VILLAGE_FACILITIES,
    };
    const request: FindFacilitiesForVillageMsReq = {
      villageId: Number(villageId),
    };

    return this.resourcesMSClient.send<any, FindFacilitiesForVillageMsReq>(
      pattern,
      request,
    );
  }

  @Get(':id')
  show(@Request() req, @Param('id') id: string) {
    const pattern = {
      cmd: ResourcesMicroServiceMessages.FIND_FACILITY,
    };
    const request: FindFacilityMsReq = {
      facilityId: Number(id),
      userId: req.user.id,
    };

    return this.resourcesMSClient.send<any, FindFacilityMsReq>(
      pattern,
      request,
    );
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Request() req, @Body() facility: CreateFacilityDto) {
    const pattern = {
      cmd: ResourcesMicroServiceMessages.CREATE_FACILITY,
    };

    return this.resourcesMSClient.send<any, CreateFacilityMsReq>(pattern, {
      facility,
      userId: req.user.id,
    });
  }

  @Put(':id/upgrade')
  upgrade(@Request() req, @Param('id') id: string) {
    const pattern = {
      cmd: ResourcesMicroServiceMessages.UPGRADE_FACILITY,
    };
    const request: UpgradeFacilityMsReq = {
      facilityId: Number(id),
      userId: req.user.id,
    };

    return this.resourcesMSClient.send<any, UpgradeFacilityMsReq>(
      pattern,
      request,
    );
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    const pattern = {
      cmd: ResourcesMicroServiceMessages.REMOVE_FACILITY,
    };
    const request: RemoveFacilityMsReq = {
      facilityId: Number(id),
    };

    return this.resourcesMSClient.send<any, RemoveFacilityMsReq>(
      pattern,
      request,
    );
  }
}
