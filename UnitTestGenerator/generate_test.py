import os
import requests
import json
import subprocess

# --- Configuration ---
# Ensure Ollama is running and the model is available
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3"  # Or "codellama", "phi3", etc.

# --- Project Paths ---
SRC_DIR = "./orgChartApi"
INSTRUCTION_FILE = "./instructions/testgen.yaml"
TEST_OUTPUT_DIR = "./tests"
BUILD_DIR = "./build"

def load_instructions(file_path: str) -> str:
    """Loads the YAML instruction file."""
    try:
        with open(file_path, "r") as f:
            return f.read()
    except FileNotFoundError:
        print(f"❌ Error: Instruction file not found at {file_path}")
        return ""

def clean_llm_response(response_text: str) -> str:
    """
    Cleans the raw response from the LLM.
    - Removes markdown code block fences (```cpp ... ```).
    - Strips leading/trailing whitespace.
    """
    # Find the start of the C++ code block
    code_start = response_text.find("```cpp")
    if code_start != -1:
        response_text = response_text[code_start + len("```cpp"):]

    # Find the end of the code block
    code_end = response_text.rfind("```")
    if code_end != -1:
        response_text = response_text[:code_end]

    return response_text.strip()

def generate_test_from_code(filename: str, code: str, prompt_instructions: str) -> str:
    """
    Sends C++ code and instructions to the Ollama LLM to generate a GoogleTest unit test.
    """
    if not prompt_instructions:
        return ""

    # Construct the prompt for the LLM
    prompt = f"""
{prompt_instructions}

Now, generate a complete, compilable GoogleTest unit test file for the following C++ source file `{filename}`.
Ensure all necessary headers like <gtest/gtest.h> and the header for the code being tested are included.

**Source Code (`{filename}`):**
```cpp
{code}
```
"""
    
    print(f"🚀 Sending {filename} to LLM for test generation...")
    
    try:
        # Make the API call to Ollama
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False
            },
            timeout=120  # Add a timeout for long-running requests
        )
        
        # Check for HTTP errors
        response.raise_for_status()

        # Extract and clean the response
        raw_response = response.json().get("response", "")
        if raw_response:
            return clean_llm_response(raw_response)
        else:
            print(f"⚠️  LLM returned an empty response for {filename}")
            return ""

    except requests.exceptions.RequestException as e:
        print(f"❌ Network or API Error for {filename}: {e}")
        return ""
    except json.JSONDecodeError:
        print(f"❌ Failed to decode JSON response from LLM for {filename}. Response: {response.text}")
        return ""

def refine_test_code(filename: str, test_code: str) -> str:
    """
    Sends generated test code back to the LLM for refinement.
    """
    print(f"🔎 Refining generated test for {filename}...")

    # Construct the refinement prompt
    prompt = f"""
You are a senior C++ test engineer. Your task is to review and refine the following GoogleTest unit test file.

**Key Objectives:**
1.  **Deduplicate:** Identify and remove any redundant or duplicate test cases.
2.  **Completeness:** Ensure all necessary headers are included (`<gtest/gtest.h>`, the header for the code under test, and any standard libraries used).
3.  **Best Practices:** Improve the tests by adding more descriptive names, using appropriate assertions, and enhancing clarity.
4.  **Formatting:** Ensure the code is clean, well-formatted, and free of any conversational text or markdown.

**Generated Test Code for `{filename}`:**
```cpp
{test_code}
```

Return only the final, complete, and refined C++ code.
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False
            },
            timeout=180  # Increased timeout for refinement task
        )
        response.raise_for_status()
        raw_response = response.json().get("response", "")
        if raw_response:
            return clean_llm_response(raw_response)
        else:
            print(f"⚠️  LLM returned an empty response during refinement for {filename}. Returning original test.")
            return test_code  # Return original code if refinement fails
    except requests.exceptions.RequestException as e:
        print(f"❌ Network or API Error during refinement for {filename}: {e}")
        return test_code
    except json.JSONDecodeError:
        print(f"❌ Failed to decode JSON response during refinement for {filename}. Response: {response.text}")
        return test_code

def run_command(command: list[str], cwd: str) -> tuple[bool, str, str]:
    """Runs a shell command and returns status, stdout, and stderr."""
    print(f"\n🏃 Running command: `{' '.join(command)}` in `{cwd}`")
    try:
        process = subprocess.run(
            command, 
            cwd=cwd, 
            capture_output=True, 
            text=True, 
            check=False
        )
        if process.returncode == 0:
            print(f"✅ Command succeeded.")
        else:
            print(f"❌ Command failed with exit code {process.returncode}")
        return process.returncode == 0, process.stdout, process.stderr
    except FileNotFoundError:
        print(f"❌ Error: Command not found: {command[0]}. Is it in your PATH?")
        return False, "", f"Command not found: {command[0]}"
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")
        return False, "", str(e)

def debug_code_with_llm(filename: str, source_code: str, test_code: str, build_logs: str) -> str:
    """Sends code and build errors to the LLM for debugging."""
    print(f"🐛 Debugging {filename} with LLM...")
    prompt = f"""
You are a C++ debugging expert. The following build failed. 
Analyze the source code, the generated test, and the build logs to identify and fix the error.

**Source Code (`{filename}`):**
```cpp
{source_code}
```

**Generated Test Code (`test_{filename}`):**
```cpp
{test_code}
```

**Build Error Logs:**
```
{build_logs}
```

Return only the corrected, complete, and compilable C++ test code. Do not include explanations or markdown.
"""
    try:
        response = requests.post(
            OLLAMA_URL,
            json={"model": MODEL_NAME, "prompt": prompt, "stream": False},
            timeout=240
        )
        response.raise_for_status()
        raw_response = response.json().get("response", "")
        if raw_response:
            print("✅ LLM provided a potential fix.")
            return clean_llm_response(raw_response)
        else:
            print("⚠️ LLM returned an empty response during debugging.")
            return test_code
    except Exception as e:
        print(f"❌ Error during LLM debugging call: {e}")
        return test_code

def build_and_run_tests(max_retries=3) -> bool:
    """Configures, builds, and runs tests, with a retry loop for debugging."""
    os.makedirs(BUILD_DIR, exist_ok=True)
    
    # Step 1: Configure with CMake
    cmake_command = ["cmake", "-S", ".", "-B", BUILD_DIR, "-DCMAKE_BUILD_TYPE=Debug"]
    success, _, stderr = run_command(cmake_command, ".")
    if not success:
        print("❌ CMake configuration failed!")
        print(stderr)
        return False

    # Step 2: Build with Make (or your build tool)
    build_command = ["cmake", "--build", BUILD_DIR]
    success, _, stderr = run_command(build_command, ".")
    
    if success:
        print("\n🎉 Build successful! Running tests...")
        # Step 3: Run tests with CTest to get coverage
        test_command = ["ctest", "--output-on-failure"]
        success, stdout, _ = run_command(test_command, BUILD_DIR)
        if success:
            print("✅ All tests passed!")
            print("Test Output:", stdout)
        return True # Build and tests passed
    else:
        print("\n🔥 Build failed. Attempting to debug with LLM...")
        return False # Build failed

def main():
    """
    Main function to generate, refine, build, and debug tests.
    """
    os.makedirs(TEST_OUTPUT_DIR, exist_ok=True)
    instructions = load_instructions(INSTRUCTION_FILE)
    if not instructions:
        print("Aborting due to missing instruction file.")
        return

    print(f"--- Starting Test Generation for project in '{SRC_DIR}' ---")
    
    # --- Generation and Refinement Loop ---
    for root, _, files in os.walk(SRC_DIR):
        for file in files:
            if file.endswith((".cpp", ".cc")):
                src_path = os.path.join(root, file)
                try:
                    with open(src_path, "r", encoding="utf-8") as source_file:
                        cpp_code = source_file.read()
                    
                    initial_test_code = generate_test_from_code(file, cpp_code, instructions)
                    if not initial_test_code:
                        print(f"⚠️ No initial test code generated for {file}.")
                        continue

                    refined_test_code = refine_test_code(file, initial_test_code)
                    
                    test_filename = f"test_{os.path.splitext(file)[0]}.cpp"
                    test_path = os.path.join(TEST_OUTPUT_DIR, test_filename)
                    with open(test_path, "w", encoding="utf-8") as test_file:
                        test_file.write(refined_test_code)
                    print(f"✅ Refined test saved: {test_path}")

                except Exception as e:
                    print(f"❌ An error occurred processing {src_path}: {e}")

    # --- Build and Debug Loop ---
    print("\n--- Entering Build and Debug Phase ---")
    if not build_and_run_tests():
        print("\nBuild failed after initial test generation. The script will exit.")
        print("Please review the logs, fix the issues, and run again.")

    print("\n--- Test Generation and Build Process Complete ---")

if __name__ == "__main__":
    main()