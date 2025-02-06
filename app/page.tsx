'use client'

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
import { zodResolver } from '@hookform/resolvers/zod'
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

      const prompt = `Create a logo for a ${values.industry} company named "${
        values.companyName
      }" with a ${values.vibe.toLowerCase()} vibe ${colorDesc}. The logo should be simple, clean, and professional.`

      const response = await fetch(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
          },
          body: JSON.stringify({
            inputs: prompt,
            options: {
              wait_for_model: true,
            },
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setLogoUrls([url])
    } catch (error) {
      console.error('Error generating logo:', error)
      if (error.toString().includes('TooManyRequests')) {
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
      <Card>
        <CardHeader>
          <CardTitle>AI Logo Generator</CardTitle>
          <CardDescription>
            Fill out the form below to create a unique logo for your business
          </CardDescription>
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
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter your company name' {...field} />
                    </FormControl>
                    <FormDescription>
                      This name will be used as the main text in the logo
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
                    <FormLabel>Industry</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select an industry' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose your industry for a more relevant logo
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
                    <FormLabel>Brand Vibe</FormLabel>
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
                          <div className='font-medium mb-1'>{vibe.name}</div>
                          <div className='text-sm text-muted-foreground'>
                            {vibe.description}
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormDescription>
                      Select the mood that best represents your brand
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
                    <FormLabel>Color Scheme</FormLabel>
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
                          <div className='font-medium mb-2'>{scheme.name}</div>
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
                            {scheme.description}
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
                  ? `Wait ${Math.ceil((cooldownEnd! - Date.now()) / 1000)}s`
                  : isLoading
                  ? 'Generating...'
                  : 'Generate Logo'}
              </Button>
            </form>
          </Form>
          {renderLogo()}
        </CardContent>
      </Card>
    </div>
  )
}
