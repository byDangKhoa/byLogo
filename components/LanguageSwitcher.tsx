'use client'

import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className='flex gap-2'>
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size='sm'
        onClick={() => setLanguage('en')}>
        EN
      </Button>
      <Button
        variant={language === 'vi' ? 'default' : 'outline'}
        size='sm'
        onClick={() => setLanguage('vi')}>
        VI
      </Button>
    </div>
  )
}
