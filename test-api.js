import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000/api';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAPI() {
  try {
    console.log('🚀 Starting API Tests for Keploy Recording...');
    
    // Wait for server to be ready
    await sleep(2000);
    
    // Test 1: Create a book
    console.log('1. Creating a book...');
    const createResponse = await fetch(`${BASE_URL}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'The Art of Programming',
        author: 'John Developer',
        price: 599,
        description: 'A comprehensive guide to programming best practices'
      })
    });
    
    if (!createResponse.ok) {
      throw new Error(`HTTP error! status: ${createResponse.status}`);
    }
    
    const createdBook = await createResponse.json();
    console.log('✅ Created book:', createdBook.message);
    
    // Test 2: Get all books
    console.log('2. Getting all books...');
    const getAllResponse = await fetch(`${BASE_URL}/books`);
    const allBooks = await getAllResponse.json();
    console.log('✅ Retrieved books count:', allBooks.length);
    
    // Test 3: Get book by ID
    if (createdBook.savedBook && createdBook.savedBook._id) {
      const bookId = createdBook.savedBook._id;
      
      console.log('3. Getting book by ID...');
      const getByIdResponse = await fetch(`${BASE_URL}/books/${bookId}`);
      const bookById = await getByIdResponse.json();
      console.log('✅ Retrieved book by ID:', bookById.name);
      
      // Test 4: Update book
      console.log('4. Updating book...');
      const updateResponse = await fetch(`${BASE_URL}/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'The Art of Programming - Second Edition',
          author: 'John Developer',
          price: 699,
          description: 'Updated comprehensive guide with new chapters',
          read: true
        })
      });
      const updatedBook = await updateResponse.json();
      console.log('✅ Updated book:', updatedBook.message);
      
      // Test 5: Create another book for testing list
      console.log('5. Creating second book...');
      const createResponse2 = await fetch(`${BASE_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Advanced Algorithms',
          author: 'Jane Coder',
          price: 799,
          description: 'Deep dive into complex algorithms and data structures'
        })
      });
      const createdBook2 = await createResponse2.json();
      console.log('✅ Created second book:', createdBook2.message);
      
      // Test 6: Get all books again
      console.log('6. Getting all books after updates...');
      const getAllResponse2 = await fetch(`${BASE_URL}/books`);
      const allBooks2 = await getAllResponse2.json();
      console.log('✅ Total books now:', allBooks2.length);
      
      // Test 7: Delete book
      console.log('7. Deleting first book...');
      const deleteResponse = await fetch(`${BASE_URL}/books/${bookId}`, {
        method: 'DELETE'
      });
      const deleteResult = await deleteResponse.json();
      console.log('✅ Delete result:', deleteResult.message);
      
      // Test 8: Verify deletion
      console.log('8. Verifying deletion - getting all books...');
      const getAllResponse3 = await fetch(`${BASE_URL}/books`);
      const allBooks3 = await getAllResponse3.json();
      console.log('✅ Books after deletion:', allBooks3.length);
    }
    
    console.log('🎉 All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
    process.exit(1);
  }
}

// Run tests
testAPI();
