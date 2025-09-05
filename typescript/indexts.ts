 import {
    HTTP_POST_METHOD,
 HTTP_GET_METHOD,

 HTTP_STATUS_OK ,
 HTTP_STATUS_INTERNAL_SERVER_ERROR } from './index.js'



 interface Handler{
    next:(val:any)=>void;
    error:(err:any)=>void;
    complete:()=>void
 }
 interface User{
    name:string;
    age:number;
    roles:string[];
    createdAt:Date;
    isDeleted:boolean
 }
 interface Request{
    method:string;
    host:string;
    path:string;
    body?:any;
    params:any
 }
 class Observer{
    private handlers:Handler;
    private isUnsubscribed:boolean;
    public _unsubscribe:(()=>void)

    constructor(handlers:Handler){
        this.handlers=handlers
        this.isUnsubscribed=false
    }

    next(value: any): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: any): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }

      this.unsubscribe();
    }
  }

  complete(): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }

      this.unsubscribe();
    }
  }

  unsubscribe(): void {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
 }

 class Observable {
    private _subscribe:(observer:Observer)=>(()=>void)
  constructor(subscribe:(observer:Observer)=>(()=>void)) {
    this._subscribe = subscribe;
  }

  static from<T>(values:T[]) {
    return new Observable((observer:Observer) => {
      values.forEach((value:T) => observer.next(value));

      observer.complete();

      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(obs:Handler) {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return ({
      unsubscribe() {
        observer.unsubscribe();
      }
    });
  }
}
const userMock:User = {
  name: 'User Name',
  age: 26,
  roles: [
    'user',
    'admin'
  ],
  createdAt: new Date(),
  isDeleted: false,
};

const requestsMock:Request[] = [
  {
    method: HTTP_POST_METHOD,
    host: 'service.example',
    path: 'user',
    body: userMock,
    params: {},
  },
  {
    method: HTTP_GET_METHOD,
    host: 'service.example',
    path: 'user',
    params: {
      id: '3f5h67s4s'
    },
  }
];

const handleRequest = (request:Request) => {
  // handling of request
  return {status: HTTP_STATUS_OK};
};
const handleError = (error:any) => {
  // handling of error
  return {status: HTTP_STATUS_INTERNAL_SERVER_ERROR};
};

const handleComplete = ():void => console.log('complete');

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete
});

subscription.unsubscribe();