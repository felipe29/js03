import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class NotifyUserOnDeleteEvent {
  get key() {
    return 'NotifyUserOnDeleteEvent';
  }

  async handle({ data }) {
    const { element } = data;
    console.log(element);
    const { date: dt1 } = element;
    const { user } = element;
    const { title } = element.event;
    const formattedDate = format(
      parseISO(dt1),
      "'dia' dd ' de ' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    await Mail.sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'MeetApp Cancelado',
      template: 'cancellation',
      context: {
        username: user.name,
        date: formattedDate,
        evento: title,
      },
    });

    /** */
  }
}

export default new NotifyUserOnDeleteEvent();
