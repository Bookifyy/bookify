<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Subject;
use App\Models\Book;
use App\Models\User;
use App\Models\ReadingProgress;
use Illuminate\Support\Str;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $subjects = [
            ['name' => 'Mathematics', 'description' => 'The study of numbers, shapes, and patterns.'],
            ['name' => 'Physics', 'description' => 'The study of matter, energy, and the fundamental forces of nature.'],
            ['name' => 'History', 'description' => 'The study of past events and civilizations.'],
            ['name' => 'Literature', 'description' => 'Written works, especially those considered of superior or lasting artistic merit.'],
            ['name' => 'Philosophy', 'description' => 'The study of the fundamental nature of knowledge, reality, and existence.'],
        ];

        foreach ($subjects as $s) {
            Subject::firstOrCreate(
                ['slug' => Str::slug($s['name'])],
                ['name' => $s['name'], 'description' => $s['description']]
            );
        }

        $math = Subject::where('name', 'Mathematics')->first();
        $physics = Subject::where('name', 'Physics')->first();
        $history = Subject::where('name', 'History')->first();
        $literature = Subject::where('name', 'Literature')->first();
        $philosophy = Subject::where('name', 'Philosophy')->first();

        $books = [
            [
                'title' => 'Calculus: Early Transcendentals',
                'author' => 'James Stewart',
                'description' => 'A comprehensive guide to calculus.',
                'subject_id' => $math->id,
                'cover_image' => 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
                'file_path' => 'books/stewart-calculus.pdf',
            ],
            [
                'title' => 'The Quantum World',
                'author' => 'Kenneth W. Ford',
                'description' => 'Quantum physics for everyone.',
                'subject_id' => $physics->id,
                'cover_image' => 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400',
                'file_path' => 'books/quantum-world.pdf',
            ],
            [
                'title' => 'Sapiens: A Brief History',
                'author' => 'Yuval Noah Harari',
                'description' => 'A look into the history of humankind.',
                'subject_id' => $history->id,
                'cover_image' => 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=400',
                'file_path' => 'books/sapiens.pdf',
            ],
            [
                'title' => 'Pride and Prejudice',
                'author' => 'Jane Austen',
                'description' => 'A classic novel of manners.',
                'subject_id' => $literature->id,
                'cover_image' => 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
                'file_path' => 'books/pride-and-prejudice.pdf',
            ],
            [
                'title' => 'Meditations',
                'author' => 'Marcus Aurelius',
                'description' => 'Stoic philosophy from a Roman Emperor.',
                'subject_id' => $philosophy->id,
                'cover_image' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
                'file_path' => 'books/meditations.pdf',
            ],
        ];

        foreach ($books as $b) {
            Book::firstOrCreate(['title' => $b['title']], $b);
        }

        // Add progress for the first user if exists
        $user = User::first();
        if ($user) {
            foreach (Book::all() as $book) {
                ReadingProgress::firstOrCreate(
                    ['user_id' => $user->id, 'book_id' => $book->id],
                    [
                        'current_page' => rand(1, 100),
                        'total_pages' => 300,
                        'percentage_completed' => rand(10, 95),
                    ]
                );
            }
        }
    }
}
