function injectScript() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';

  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
}

function pushData(...data) {
  window._gaq = window._gaq || [];
  window._gaq.push(data);

  console.log('GA push', data);
}

class GoogleAnalytics {

  init(account) {
    this._account = account;

    pushData('_setAccount', account);
    pushData('_trackPageview');

    injectScript();
  }

  //_trackEvent(category, action, opt_label, opt_value, opt_noninteraction)
  trackEvent(data) {
    if(!data.category || !data.action) {
      console.warn('Category and Action are required parameters.');
      return;
    }

    pushData('_trackEvent', data.category, data.action, data.label, data.value, data.noninteraction)
  }

}

export default new GoogleAnalytics();
