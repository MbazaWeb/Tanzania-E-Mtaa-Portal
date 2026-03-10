/**
 * Kibari cha Matukio / Sherehe Form
 * Event / Celebration Permit
 * 
 * Service: Kibari cha Matukio / Sherehe
 * Fee: 20,000 TZS
 */
import React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { FormProps, labels } from './types';

// Event type options
const EVENT_TYPES = [
  { label: 'HARUSI - Wedding', value: 'HARUSI' },
  { label: 'HITIMU - Graduation', value: 'HITIMU' },
  { label: 'TAMASHA - Festival', value: 'TAMASHA' },
  { label: 'MKUTANO - Meeting', value: 'MKUTANO' },
  { label: 'NYINGINEZO - Other', value: 'NYINGINEZO' },
];

interface FormData {
  // Event info
  event_type: string;
  event_name: string;
  // Date and venue
  start_date: string;
  start_time: string;
  venue: string;
  expected_guests: number;
  // Contact info
  contact_person: string;
  contact_phone: string;
  whatsapp_group: string;
}

export const KibariShereheForm: React.FC<FormProps> = ({
  onSubmit,
  isLoading,
  lang = 'sw',
  userProfile
}) => {
  const t = labels[lang];
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onFormSubmit = (data: FormData) => {
    onSubmit(data, [], 'self');
  };

  const inputClass = "w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all";
  const labelClass = "block text-sm font-semibold text-stone-700 mb-2";
  const sectionClass = "bg-gradient-to-r from-pink-50 to-rose-50 p-3 rounded-xl border-l-4 border-pink-500 mb-4";

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Section: Event Type */}
      <div className={sectionClass}>
        <h3 className="font-bold text-pink-800">
          {lang === 'sw' ? 'AINA YA TUKIO' : 'EVENT TYPE'}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Aina ya Tukio' : 'Event Type'} <span className="text-red-500">*</span>
          </label>
          <select 
            {...register('event_type', { required: true })} 
            className={inputClass}
          >
            <option value="">{t.selectOption}</option>
            {EVENT_TYPES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.event_type && <span className="text-red-500 text-sm">{t.required}</span>}
        </div>

        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Jina la Tukio' : 'Event Name'} <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            {...register('event_name', { required: true })} 
            className={inputClass}
            placeholder={lang === 'sw' ? 'Mfano: Harusi ya John & Mary' : 'E.g.: John & Mary Wedding'}
          />
          {errors.event_name && <span className="text-red-500 text-sm">{t.required}</span>}
        </div>
      </div>

      {/* Section: Date and Venue */}
      <div className={sectionClass}>
        <h3 className="font-bold text-pink-800">
          {lang === 'sw' ? 'MUDA NA MAHALI' : 'DATE AND VENUE'}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Tarehe ya Kuanza' : 'Start Date'} <span className="text-red-500">*</span>
          </label>
          <input 
            type="date" 
            {...register('start_date', { required: true })} 
            className={inputClass}
          />
          {errors.start_date && <span className="text-red-500 text-sm">{t.required}</span>}
        </div>

        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Muda wa Kuanza' : 'Start Time'} <span className="text-red-500">*</span>
          </label>
          <input 
            type="time" 
            {...register('start_time', { required: true })} 
            className={inputClass}
          />
          {errors.start_time && <span className="text-red-500 text-sm">{t.required}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Jina la Ukumbi / Eneo' : 'Venue Name'} <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            {...register('venue', { required: true })} 
            className={inputClass}
            placeholder={lang === 'sw' ? 'Mfano: AICC, Diamond Jubilee Hall' : 'E.g.: AICC, Diamond Jubilee Hall'}
          />
          {errors.venue && <span className="text-red-500 text-sm">{t.required}</span>}
        </div>

        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Idadi ya Wageni (Inayokadiriwa)' : 'Expected Guests'} <span className="text-red-500">*</span>
          </label>
          <input 
            type="number" 
            {...register('expected_guests', { required: true, min: 1 })} 
            className={inputClass}
            placeholder="0"
          />
          {errors.expected_guests && <span className="text-red-500 text-sm">{t.required}</span>}
        </div>
      </div>

      {/* Section: Contact Info */}
      <div className={sectionClass}>
        <h3 className="font-bold text-pink-800">
          {lang === 'sw' ? 'MWASILIANO' : 'CONTACT INFORMATION'}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Msimamizi wa Tukio' : 'Event Organizer'} <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            {...register('contact_person', { required: true })} 
            className={inputClass}
          />
          {errors.contact_person && <span className="text-red-500 text-sm">{t.required}</span>}
        </div>

        <div>
          <label className={labelClass}>
            {lang === 'sw' ? 'Simu ya Msimamizi' : 'Organizer Phone'} <span className="text-red-500">*</span>
          </label>
          <input 
            type="tel" 
            {...register('contact_phone', { required: true })} 
            className={inputClass}
            placeholder="+255 7XX XXX XXX"
          />
          {errors.contact_phone && <span className="text-red-500 text-sm">{t.required}</span>}
        </div>
      </div>

      <div>
        <label className={labelClass}>
          {lang === 'sw' ? 'Kiungo cha Group la WhatsApp' : 'WhatsApp Group Link'}
        </label>
        <input 
          type="url" 
          {...register('whatsapp_group')} 
          className={inputClass}
          placeholder="https://chat.whatsapp.com/..."
        />
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t.submitting}
            </>
          ) : (
            t.submit
          )}
        </button>
      </div>
    </form>
  );
};

export default KibariShereheForm;
