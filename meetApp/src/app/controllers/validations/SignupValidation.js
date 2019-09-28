import * as Yup from 'yup';

class SignupValidation {
  validateOnCreate() {
    const schema = Yup.object().shape({
      eventId: Yup.number().required(),
    });
    return schema;
  }
}

export default new SignupValidation();
