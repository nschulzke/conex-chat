module.exports = function(api, target) {
  if (api == 'rest') return getRest(target);
}

function getRest(res) {
  return {
    res: res,
    success: function(name, object) {
      this.res.status(200).json({
        [name]: object
      });
    },
    catchError: function(error) {
      if (error.status === undefined) {
        error.status = 500;
        console.log(error);
      }
      this.res.status(error.status).json(error);
    }
  }
}
