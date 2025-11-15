'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useConfigStore } from '@/lib/store/config-store';
import { scaffoldConfigSchema, type ScaffoldConfig } from '@/types';

export function ConfigurationWizard() {
  const { config, updateConfig } = useConfigStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ScaffoldConfig>({
    resolver: zodResolver(scaffoldConfigSchema),
    defaultValues: config,
    mode: 'onChange',
  });

  // Watch form changes and sync with store
  const formValues = watch();

  const onSubmit = (data: ScaffoldConfig) => {
    updateConfig(data);
  };

  // Sync form changes to store in real-time
  const handleFieldChange = (
    field: keyof ScaffoldConfig,
    value: ScaffoldConfig[keyof ScaffoldConfig],
  ) => {
    updateConfig({ [field]: value });
  };

  return (
    <div className="w-full">
      <div className="mb-6 md:mb-8 fade-in">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
          Configure Your Stack
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Select your preferred technologies to generate a custom project scaffold
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
        {/* Project Basics Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Project Basics</h2>
          <div className="space-y-3 md:space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium mb-1">
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                {...register('projectName')}
                onChange={(e) => handleFieldChange('projectName', e.target.value)}
                className="w-full px-3 py-2 text-sm md:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation"
                placeholder="my-awesome-project"
              />
              {errors.projectName && (
                <p className="text-red-500 text-sm mt-1">{errors.projectName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full px-3 py-2 text-sm md:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 touch-manipulation"
                placeholder="A brief description of your project"
                rows={3}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Framework Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Framework</h2>
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Framework Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3" role="radiogroup" aria-label="Framework selection">
                {(['next', 'express', 'monorepo'] as const).map((fw) => (
                  <label
                    key={fw}
                    className={`flex items-center justify-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation ${
                      formValues.framework === fw
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      value={fw}
                      {...register('framework')}
                      onChange={(e) => handleFieldChange('framework', e.target.value)}
                      className="sr-only"
                      aria-label={`${fw} framework`}
                      aria-checked={formValues.framework === fw}
                    />
                    <span className="font-medium text-sm md:text-base capitalize">{fw}</span>
                  </label>
                ))}
              </div>
            </div>

            {formValues.framework === 'next' && (
              <div>
                <label className="block text-sm font-medium mb-2">Next.js Router</label>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {(['app', 'pages'] as const).map((router) => (
                    <label
                      key={router}
                      className={`flex items-center justify-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation ${
                        formValues.nextjsRouter === router
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        value={router}
                        {...register('nextjsRouter')}
                        onChange={(e) => handleFieldChange('nextjsRouter', e.target.value)}
                        className="sr-only"
                      />
                      <span className="font-medium text-sm md:text-base capitalize">{router} Router</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Authentication Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Authentication</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3" role="radiogroup" aria-label="Authentication provider selection">
            {(['none', 'nextauth', 'supabase', 'clerk'] as const).map((authOption) => (
              <label
                key={authOption}
                className={`flex items-center justify-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation ${
                  formValues.auth === authOption
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  value={authOption}
                  {...register('auth')}
                  onChange={(e) => handleFieldChange('auth', e.target.value)}
                  className="sr-only"
                  aria-label={`${authOption} authentication`}
                  aria-checked={formValues.auth === authOption}
                />
                <span className="font-medium text-sm md:text-base capitalize">{authOption}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Database Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Database</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
            {(
              [
                'none',
                'prisma-postgres',
                'drizzle-postgres',
                'supabase',
                'mongodb',
              ] as const
            ).map((dbOption) => (
              <label
                key={dbOption}
                className={`flex items-center justify-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation ${
                  formValues.database === dbOption
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  value={dbOption}
                  {...register('database')}
                  onChange={(e) => handleFieldChange('database', e.target.value)}
                  className="sr-only"
                />
                <span className="font-medium text-xs md:text-sm">{dbOption}</span>
              </label>
            ))}
          </div>
        </section>

        {/* API Layer Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">API Layer</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
            {(['rest-fetch', 'rest-axios', 'trpc', 'graphql'] as const).map((apiOption) => (
              <label
                key={apiOption}
                className={`flex items-center justify-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation ${
                  formValues.api === apiOption
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  value={apiOption}
                  {...register('api')}
                  onChange={(e) => handleFieldChange('api', e.target.value)}
                  className="sr-only"
                />
                <span className="font-medium text-xs md:text-sm">{apiOption}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Styling Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Styling</h2>
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">CSS Framework</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
                {(['tailwind', 'css-modules', 'styled-components'] as const).map(
                  (styleOption) => (
                    <label
                      key={styleOption}
                      className={`flex items-center justify-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all touch-manipulation ${
                        formValues.styling === styleOption
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        value={styleOption}
                        {...register('styling')}
                        onChange={(e) => handleFieldChange('styling', e.target.value)}
                        className="sr-only"
                      />
                      <span className="font-medium text-xs md:text-sm">{styleOption}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 cursor-pointer touch-manipulation">
                <input
                  type="checkbox"
                  {...register('shadcn')}
                  onChange={(e) => handleFieldChange('shadcn', e.target.checked)}
                  className="w-5 h-5 md:w-4 md:h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  aria-label="Include shadcn/ui components"
                />
                <span className="text-sm font-medium">Include shadcn/ui components</span>
              </label>
            </div>
          </div>
        </section>

        {/* Tooling Extras Section */}
        <section className="bg-white rounded-lg border p-4 md:p-6 hover-lift transition-shadow hover:shadow-md fade-in">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Tooling Extras</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4" role="group" aria-label="Tooling extras">
            {Object.keys(config.extras).map((extra) => (
              <label key={extra} className="flex items-center space-x-2 cursor-pointer touch-manipulation">
                <input
                  type="checkbox"
                  {...register(`extras.${extra as keyof typeof config.extras}`)}
                  onChange={(e) =>
                    handleFieldChange('extras', {
                      ...formValues.extras,
                      [extra]: e.target.checked,
                    })
                  }
                  className="w-5 h-5 md:w-4 md:h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  aria-label={`Include ${extra.replace(/([A-Z])/g, ' $1').trim()}`}
                />
                <span className="text-sm font-medium capitalize">
                  {extra.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </section>
      </form>
    </div>
  );
}
