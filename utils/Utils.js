const UTILS = {};


UTILS.loadFile = function(url)
{
    return fetch(url).then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status); // Rejects the promise
        }else{
            return response.text();
        }
    });
}
