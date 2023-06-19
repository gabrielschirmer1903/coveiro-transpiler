-- simple print
local x = 10
print(x)


-- if test
local age = 18

if age >= 18 then
  print("Adult")
else
  print("Minor")
end


-- ranged loop
for i = 1, 5 do
    print(i)
end

-- function call

function addNumbers(a, b)
    return a + b
end

print(addNumbers(10, 20))

local result = addNumbers(10, 20)
print(result)

-- array iteration

local myArray = {10, 20, 30, 40, 50}

for i, value in ipairs(myArray) do
  print(value)
end


-- fibbo

function fibonacci(n)
    if n <= 0 then
        return "O número deve ser maior que zero."
    elseif n == 1 then
        return 0
    elseif n == 2 then
        return 1
    else
        local a, b = 0, 1
        local result
        for i = 3, n do
            result = a + b
            a, b = b, result
        end
        return result
    end
end

print(fibonacci(10))