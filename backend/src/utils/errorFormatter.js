const errorFormatter = (error) => {
    try {
        return `${error.location}[${error.path}]: ${error.msg}`;
    } catch (error) {
        console.log("Something went wrong with the error formatter.");
    }
}


export default errorFormatter;