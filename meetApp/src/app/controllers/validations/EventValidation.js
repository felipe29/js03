import * as Yup from 'yup';

class EventValidation {
  validateOnCreate() {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
    });

    return schema;
  }
}

export default new EventValidation();
