
class Api {
  static okWithContent(res, content) {
    return res.status(200).send(content);
  }

  static errorWithMessage(res, errorCode, errorMessage) {
    return res.status(errorCode).send(`{"error": ${errorMessage}}`);
  }
}

export default Api;
