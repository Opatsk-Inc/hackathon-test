import { Controller, Get, HttpCode, HttpStatus, Sse, MessageEvent } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { RealtimeService } from './common/realtime.service';


@ApiTags('health-check')
@Controller('')
export class AppController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  healthCheck(): void {}

  @Sse('api/events')
  sendEvents(): Observable<MessageEvent> {
    return this.realtimeService.getEventsObservable();
  }
}
