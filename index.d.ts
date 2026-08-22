export type EventMap = Record<string, unknown[]>;

export type EventCallback<Payload extends unknown[] = unknown[]> = (
  ...payload: Payload
) => void;

export class HYEventBus<Events extends EventMap = EventMap> {
  on<EventName extends Extract<keyof Events, string>>(
    eventName: EventName,
    eventCallback: EventCallback<Events[EventName]>,
    thisArg?: unknown
  ): this;

  once<EventName extends Extract<keyof Events, string>>(
    eventName: EventName,
    eventCallback: EventCallback<Events[EventName]>,
    thisArg?: unknown
  ): this;

  emit<EventName extends Extract<keyof Events, string>>(
    eventName: EventName,
    ...payload: Events[EventName]
  ): this;

  off<EventName extends Extract<keyof Events, string>>(
    eventName: EventName,
    eventCallback: EventCallback<Events[EventName]>
  ): this;

  clear(): this;

  hasEvent(eventName: string): boolean;
}

export type StoreAction<
  State extends object,
  Args extends unknown[] = unknown[],
  Result = unknown
> = (state: State, ...args: Args) => Result;

export type StoreActions<State extends object> = Record<
  string,
  StoreAction<State, any[], any>
>;

export interface HYEventStoreOptions<
  State extends object,
  Actions extends StoreActions<State> = Record<never, never>
> {
  state: State;
  actions?: Actions & StoreActions<State>;
}

type StateKey<State extends object> = Extract<keyof State, string>;
type StateChange<State extends object, Key extends StateKey<State>> = Partial<
  Pick<State, Key>
>;
type ActionArguments<State extends object, Action> = Action extends (
  state: State,
  ...args: infer Args
) => unknown
  ? Args
  : never;
type ActionResult<Action> = Action extends (...args: any[]) => infer Result
  ? Result
  : never;

export class HYEventStore<
  State extends object,
  Actions extends StoreActions<State> = Record<never, never>
> {
  constructor(options: HYEventStoreOptions<State, Actions>);

  state: State;
  actions: Actions;

  onState<Key extends StateKey<State>>(
    stateKey: Key,
    stateCallback: (value: State[Key]) => void
  ): void;

  offState<Key extends StateKey<State>>(
    stateKey: Key,
    stateCallback: (value: State[Key]) => void
  ): void;

  onStates<Keys extends readonly StateKey<State>[]>(
    stateKeys: Keys,
    stateCallback: (change: StateChange<State, Keys[number]>) => void
  ): void;

  offStates<Keys extends readonly StateKey<State>[]>(
    stateKeys: Keys,
    stateCallback: (change: StateChange<State, Keys[number]>) => void
  ): void;

  setState<Key extends StateKey<State>>(
    stateKey: Key,
    stateValue: State[Key]
  ): void;

  dispatch<ActionName extends Extract<keyof Actions, string>>(
    actionName: ActionName,
    ...args: ActionArguments<State, Actions[ActionName]>
  ): ActionResult<Actions[ActionName]>;
}
