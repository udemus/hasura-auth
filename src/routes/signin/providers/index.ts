import { Router } from 'express';
import session from 'express-session';
import grant, { GrantSession } from 'grant';
import github from './github';
import google from './google';
import facebook from './facebook';
// import twitter from './twitter';
import apple from './apple';
import windowslive from './windowslive';
import linkedin from './linkedin';
import spotify from './spotify';
import strava from './strava';
import gitlab from './gitlab';
import bitbucket from './bitbucket';
import discord from './discord';
import twitch from './twitch';
import { ENV } from '@/utils/env';
import { PROVIDERS } from '@config/providers';

declare module 'express-session' {
  interface SessionData {
    grant: GrantSession;
  }
}

const router = Router();

github(router);
google(router);
facebook(router);
// twitter(router);
apple(router);
windowslive(router);
linkedin(router);
spotify(router);
strava(router);
gitlab(router);
bitbucket(router);
discord(router);
twitch(router);

export default (parentRouter: Router) => {
  /**
   * GET /signin/provider/{provider}
   * @summary
   * @param {string} provider.path.required - name param description - enum:github,google,facebook,twitter,apple,windowslive,linkedin,spotify,strava,gitlab,bitbucket
   * @param {string} redirectUrl.query.required -
   * @return {string} 501 - The provider is not enabled - text/plain
   * @tags Authentication
   */

  /**
   * GET /signin/provider/{provider}/callback
   * @summary Oauth callback url, that will be used by the Oauth provider, to redirect to the client application. Attention: all providers are using a GET operation, except Apple that uses POST
   * @param {string} provider.path.required - name param description - enum:github,google,facebook,twitter,apple,windowslive,linkedin,spotify,strava,gitlab,bitbucket
   * @param {string} redirectUrl.query.required
   * @return {string} 302 - Redirect to the initial url given as a query parameter in /signin/provider/{provider}
   * @tags Authentication
   */
  parentRouter.use('/signin/provider', router);
  parentRouter
    .use(require('body-parser').urlencoded({ extended: true }))
    .use(session({ secret: 'grant', saveUninitialized: true, resave: false }))
    .use(
      grant.express({
        defaults: {
          prefix: '/signin/provider',
          origin: ENV.AUTH_SERVER_URL,
          transport: 'session',
          state: true,
        },
        twitter2: {
          key: PROVIDERS.twitter?.consumerKey,
          secret: PROVIDERS.twitter?.consumerSecret,
          state: true,
          pkce: true,
          response: ['tokens', 'profile'],
          scope: ['users.read', 'tweet.read'],
        },
      })
    );
  parentRouter.get('/signin/provider/twitter2/callback', (req, res) => {
    console.log(req.session);
    return res.send(req.session.grant?.response?.profile);
  });
};
