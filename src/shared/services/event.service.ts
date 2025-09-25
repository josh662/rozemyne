import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { EEventType, IEvent, IEventOptions } from 'src/interfaces';
import { PrismaService } from 'src/prisma';

@Injectable()
export class EventService {
  constructor(
    readonly prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}
  private readonly logger = new Logger(EventService.name);

  custom(
    origin: string,
    action: string,
    payload: any,
    options?: Partial<IEventOptions>,
  ) {
    this.apply(origin, action, payload, options);
  }

  create(origin: string, payload: any, options?: Partial<IEventOptions>) {
    this.apply(origin, 'create', payload, options);
  }

  update(origin: string, payload: any, options?: Partial<IEventOptions>) {
    this.apply(origin, 'update', payload, options);
  }

  remove(origin: string, payload: any, options?: Partial<IEventOptions>) {
    this.apply(origin, 'remove', payload, options);
  }

  emit(event: string, data: IEvent) {
    this.logger.log(`Emitting event: ${event}`);
    this.eventEmitter.emit(event, data);
  }

  private async apply(
    origin: string,
    action: string,
    payload: Record<string, any>,
    options?: Partial<IEventOptions>,
  ) {
    try {
      const eventName = `${process.env.SERVER_NAME}.${origin}.${action}`;

      this.logger.verbose(
        JSON.stringify({
          payload,
          options: {
            type: EEventType.PUBLIC,
            time: new Date(),
            ...options,
            eventName,
          },
        }),
      );

      delete options?.props;

      this.emit(eventName, {
        payload,
        options: {
          type: EEventType.PUBLIC,
          time: new Date(),
          ...options,
          eventName,
        },
      });
    } catch (err) {
      this.logger.error(`Error applying event: ${JSON.stringify(err)}`);
      console.error(err);
    }
  }
}
