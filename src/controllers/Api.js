
class Api {
  // for all: use res.set('Content-Type', 'application/json');
  static okWithContent(res, content) {
    return res.status(200).send(content);
  }

  static okWithMessage(res, message) {
    return res.status(200).send(`{"message": ${message}`);

  }

  static errorWithMessage(res, errorCode, errorMessage) {
    return res.status(errorCode).send(`{"error": ${errorMessage}}`);
  }
}

export default Api;
