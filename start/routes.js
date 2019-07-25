module.exports = function ($route, $logger) {
    /** Register HTTP requests **/
    $route.get("/", "HomeController@welcome");
    $route.any("/speech", "HomeController@speech");
    /** Register socket.io requests **/
    /** Register filters **/
};