/**
 * 判断是否是微信浏览器
 */
export function isWeixin(): boolean {
  return navigator.userAgent.toLowerCase().indexOf('micromessenger') > -1;
}

/**
 * 延迟, 用于 async await 等待
 * 用例:
 * (async ()=>{
 *   console.log('等待1s');
 *   await delay(1000);
 *   console.log('完成');
 * })();
 * @param ms {number} 毫秒
 */
export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
