/**
 * @param {number} timeout
 * @return {Promise<void>}
 */
export const delay = (timeout) => new Promise(resolve => {
    setTimeout(resolve, timeout);
});
