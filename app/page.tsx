'use client'

import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Image from 'next/image'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const COLOR_SCHEMES = [
  {
    name: 'Custom',
    colors: ['#000000', '#000000', '#000000'], // Default black colors
    description: 'Choose your own colors (up to 3)',
  },
  {
    name: 'Professional',
    colors: ['#2C3E50', '#E74C3C', '#ECF0F1'],
    description: 'Suitable for business and finance',
  },
  {
    name: 'Creative',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    description: 'For creative and design industries',
  },
  {
    name: 'Tech',
    colors: ['#6C5CE7', '#00B894', '#81ECEC'],
    description: 'Perfect for tech companies and startups',
  },
  {
    name: 'Natural',
    colors: ['#27AE60', '#F1C40F', '#2ECC71'],
    description: 'For food and environmental businesses',
  },
  {
    name: 'Luxury',
    colors: ['#000000', '#B7935B', '#FFFFFF'],
    description: 'Suitable for fashion and luxury brands',
  },
] as const

// Replace the useEffect and industries state with a constant array
const INDUSTRIES = [
  'Technology & Software',
  'Financial Services',
  'Healthcare & Medical',
  'Education & Training',
  'Retail & E-commerce',
  'Manufacturing',
  'Real Estate',
  'Food & Beverage',
  'Media & Entertainment',
  'Consulting & Business Services',
  'Transportation & Logistics',
  'Construction & Architecture',
  'Marketing & Advertising',
  'Travel & Hospitality',
  'Energy & Utilities',
  'Fashion & Apparel',
  'Agriculture & Farming',
  'Automotive',
  'Telecommunications',
  'Pharmaceuticals',
  'Insurance',
  'Legal Services',
  'Sports & Fitness',
  'Art & Design',
] as const

// Add vibe options constant
const VIBES = [
  {
    name: 'Professional',
    description: 'Trustworthy, reliable, and established',
  },
  {
    name: 'Innovative',
    description: 'Forward-thinking, cutting-edge, and dynamic',
  },
  {
    name: 'Playful',
    description: 'Fun, energetic, and approachable',
  },
  {
    name: 'Luxurious',
    description: 'Premium, elegant, and sophisticated',
  },
  {
    name: 'Eco-friendly',
    description: 'Sustainable, natural, and conscious',
  },
  {
    name: 'Minimalist',
    description: 'Clean, simple, and modern',
  },
  {
    name: 'Traditional',
    description: 'Classic, timeless, and authentic',
  },
  {
    name: 'Bold',
    description: 'Strong, confident, and impactful',
  },
  {
    name: 'Creative',
    description: 'Artistic, imaginative, and unique',
  },
  {
    name: 'Friendly',
    description: 'Welcoming, warm, and community-focused',
  },
  {
    name: 'Tech-savvy',
    description: 'Digital, connected, and advanced',
  },
  {
    name: 'Vintage',
    description: 'Retro, nostalgic, and classic',
  },
] as const

// Update the form schema
const formSchema = z.object({
  companyName: z.string().min(2, {
    message: 'Company name must be at least 2 characters.',
  }),
  industry: z.enum(INDUSTRIES, {
    required_error: 'Please select an industry.',
  }),
  vibe: z.string({
    required_error: 'Please select a vibe.',
  }),
  colorScheme: z.string({
    required_error: 'Please select a color scheme.',
  }),
})

// Define the form input types
type LogoFormValues = z.infer<typeof formSchema>

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  )
}

function HomeContent() {
  const { t } = useLanguage()
  // Initialize the form
  const form = useForm<LogoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      industry: undefined,
      vibe: '',
      colorScheme: '',
    },
  })

  // Update state to handle multiple logos
  const [isLoading, setIsLoading] = useState(false)
  const [logoUrls, setLogoUrls] = useState<string[]>([])

  // Add new state variables
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null)
  const [customColors, setCustomColors] = useState<string[]>([
    '#000000',
    '#000000',
    '#000000',
  ])

  // Add helper function to check cooldown
  const isInCooldown = () => {
    if (!cooldownEnd) return false
    return Date.now() < cooldownEnd
  }

  // Helper function to detect Vietnamese text
  const containsVietnamese = (text: string): boolean => {
    // Vietnamese diacritic characters regex
    const vietnameseRegex =
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i
    return vietnameseRegex.test(text)
  }

  // Handle form submission
  const handleSubmit = async (values: LogoFormValues) => {
    if (isInCooldown()) {
      const remainingSeconds = Math.ceil((cooldownEnd! - Date.now()) / 1000)
      alert(
        `Please wait ${remainingSeconds} seconds before generating a new logo.`
      )
      return
    }

    setIsLoading(true)
    setLogoUrls([])
    try {
      let companyName = values.companyName

      // Translate if Vietnamese text is detected
      if (containsVietnamese(companyName)) {
        const translateResponse = await axios.post(
          'https://libretranslate.de/translate',
          {
            q: companyName,
            source: 'vi',
            target: 'en',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        companyName = translateResponse.data.translatedText
      }

      const selectedScheme = COLOR_SCHEMES.find(
        (s) => s.name === values.colorScheme
      )
      const colorDesc = selectedScheme
        ? `using the colors ${
            values.colorScheme === 'Custom'
              ? customColors.join(', ')
              : selectedScheme.colors.join(', ')
          }`
        : ''

      const prompt = `Create a logo for a ${
        values.industry
      } company named "${companyName}" with a ${values.vibe.toLowerCase()} vibe ${colorDesc}. The logo should be simple and clean and professional.`

      const response = await axios.post(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
        {
          inputs: prompt,
          options: {
            wait_for_model: true,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
          },
          responseType: 'blob',
        }
      )

      const url = URL.createObjectURL(response.data)
      setLogoUrls([url])
    } catch (error) {
      console.error('Error generating logo:', error)
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        setCooldownEnd(Date.now() + 60000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Add this before the return statement to display the generated logo
  const renderLogo = () => {
    if (isLoading)
      return (
        <div className='flex justify-center py-8'>
          <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin' />
        </div>
      )
    if (logoUrls.length > 0)
      return (
        <div className='mt-6'>
          <div className='relative aspect-square'>
            <Image
              src={logoUrls[0]}
              alt='Generated Logo'
              fill
              className='object-contain'
              priority
            />
            <Button
              className='mt-2 w-full'
              onClick={() => window.open(logoUrls[0], '_blank')}>
              Download Logo
            </Button>
          </div>
        </div>
      )
    return null
  }

  return (
    <div className='container mx-auto py-10'>
      <div className='flex justify-end mb-4'>
        <LanguageSwitcher />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-6'>
              <FormField
                control={form.control}
                name='companyName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.companyName.label')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.companyName.placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('form.companyName.description')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='industry'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.industry.label')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('form.industry.placeholder')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {t(`form.industry.options.${industry}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t('form.industry.description')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='vibe'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.vibe.label')}</FormLabel>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {VIBES.map((vibe) => (
                        <div
                          key={vibe.name}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            field.value === vibe.name
                              ? 'ring-2 ring-primary'
                              : 'hover:border-primary'
                          }`}
                          onClick={() => field.onChange(vibe.name)}>
                          <div className='font-medium mb-1'>
                            {t(`form.vibe.options.${vibe.name}.name`)}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {t(`form.vibe.options.${vibe.name}.description`)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormDescription>
                      {t('form.vibe.description')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='colorScheme'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.colorScheme.label')}</FormLabel>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {COLOR_SCHEMES.map((scheme) => (
                        <div
                          key={scheme.name}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            field.value === scheme.name
                              ? 'ring-2 ring-primary'
                              : 'hover:border-primary'
                          }`}
                          onClick={() => field.onChange(scheme.name)}>
                          <div className='font-medium mb-2'>
                            {t(`form.colorScheme.options.${scheme.name}.name`)}
                          </div>
                          <div className='flex gap-2 mb-2'>
                            {scheme.name === 'Custom'
                              ? customColors.map((color, index) => (
                                  <div key={index} className='relative'>
                                    <input
                                      type='color'
                                      value={color}
                                      onChange={(e) => {
                                        const newColors = [...customColors]
                                        newColors[index] = e.target.value
                                        setCustomColors(newColors)
                                      }}
                                      className='w-8 h-8 rounded-full cursor-pointer appearance-none bg-transparent'
                                      style={{
                                        WebkitAppearance: 'none',
                                        border: 'none',
                                        padding: 0,
                                        background: color,
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <div
                                      className='absolute inset-0 rounded-full pointer-events-none'
                                      style={{ backgroundColor: color }}
                                    />
                                  </div>
                                ))
                              : scheme.colors.map((color) => (
                                  <div
                                    key={color}
                                    className='w-8 h-8 rounded-full'
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {t(
                              `form.colorScheme.options.${scheme.name}.description`
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                className='w-full'
                disabled={isInCooldown() || isLoading}>
                {isInCooldown()
                  ? t('form.submit.wait').replace(
                      '{{seconds}}',
                      Math.ceil((cooldownEnd! - Date.now()) / 1000).toString()
                    )
                  : isLoading
                  ? t('form.submit.generating')
                  : t('form.submit.generate')}
              </Button>
            </form>
          </Form>
          {renderLogo()}
        </CardContent>
      </Card>
    </div>
  )
}
