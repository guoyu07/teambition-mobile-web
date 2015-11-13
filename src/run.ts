/// <reference path='components/interface/teambition.d.ts' />

import WechatService = Wechat.WechatService;
import MomentLocale = Locale.MomentLocale;
import DingService = Ding.DingService;

module teambition {
  'use strict';

  declare let webkitURL;
  declare let wx;
  declare let dd;
  declare let Spiderjs;
  declare let zone: Zone;

  export let Wechat: WechatService;
  export let Ding: DingService;

  export let spider: any;

  export interface IWxSignature {
    noncestr: string;
    signature: string;
    timestamp: number;
  }

  export interface IDingSignature {
    corpId: string;
    nonceStr: string;
    signature: string;
    timeStamp: number;
  }

  export let rootZone = zone.fork();

  export let $$injector: any;

  export let URL: URL = URL || webkitURL;
  export let nobodyUrl = 'images/nobody-avator@2x.png';

  export function noop() {
    return false;
  };

  class Run {
    private zone: Zone;
    constructor() {
      this.zone = rootZone;
      this.zone.run(noop);
    }
  }

  // @ngInject
  var RunFn = function(
    $http: any,
    $q: angular.IQService,
    $rootScope: IRootScope,
    app: Iapp,
    Moment: moment.MomentStatic
  ) {

    let run = new Run();
    let initWechat = () => {
      return $http.get('/weixin/dev/signature');
    };

    let initDD = () => {
      return $http.get(app.dingApiHost + '/signature');
    };

    if (typeof wx === 'object') {
      initWechat()
      .then((data: IWxSignature) => {
        Wechat = new WechatService(app.wxid, data.noncestr, data.timestamp, data.signature);
      })
      .catch((reason: any) => {
        console.log('error', '微信SDK初始化失败', '您不能正常使用分享项目给好友功能');
      });
    }else if (typeof dd === 'object') {
      initDD().then((data: any) => {
        let info: IDingSignature = data.data;
        Ding = new DingService(app.dingAgentId, info.corpId, info.timeStamp, info.nonceStr, info.signature);
        Ding.setTitle('Teambition');
      });
    }

    let deferred = $q.defer();
    deferred.resolve();
    $rootScope.pending = deferred.promise;

    $http.defaults.headers.common.Authorization = 'OAuth2 JL_N0f_OP6dpvTOKjQe8e7wCi5w=MCN3vfXo99625ad6abf2bf03774c86d6ba205ceff8da45c6553c9bd488f5d80c9ac49ebb191697aad985141dc8e94aa064f30e558f3a90194505323a58fe85cb162ee6df2554f253692fc09aced2bb4475ef0f1d5e68f1be529842eec4ff020100829d74d0f89c0c0501be279ff8a08bf4cb6c7b';

    MomentLocale(app.LANGUAGE, Moment);

    return run;
  };

  export let inject = (services: string[]) => {
    if (!services || !services.length) {
      return;
    }
    let service: any;
    return function(Target: any) {
      angular.module('teambition').run(['$injector', ($injector: any) => {
        $$injector = $injector;
        angular.forEach(services, (name: string, index: number) => {
          try {
            service = $injector.get(name);
            Target.prototype[name] = service;
          } catch (error) {
            console.error(error);
          }
        });
      }]);
    };
  };

  angular.module('teambition').run(RunFn);
}
