export default function AboutSection() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">About Us</h2>
            <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        Founded in 2022, our journey began with a simple vision: to make advanced AI technologies accessible to everyone. 
                        What started as a small team of passionate engineers and data scientists has grown into a global community 
                        dedicated to pushing the boundaries of what AI can accomplish.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                        Our flagship AI Title Generator was born from the realization that content creators spend hours crafting 
                        the perfect headline. We leveraged cutting-edge natural language processing to create an intelligent system 
                        that understands context, audience preferences, and engagement patterns.
                    </p>
                </div>
                <div className="rounded-lg overflow-hidden shadow-xl">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-64 flex items-center justify-center">
                        <span className="text-white text-xl font-medium">Company Image</span>
                    </div>
                </div>
            </div>
        </section>
    );
}