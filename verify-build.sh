#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  @ldesign/crypto 构建验证脚本${NC}"
echo -e "${BLUE}========================================${NC}\n"

# 记录开始时间
START_TIME=$(date +%s)

# 初始化计数器
TOTAL_PACKAGES=0
SUCCESS_PACKAGES=0
FAILED_PACKAGES=()

# 进入 crypto 目录
cd "$(dirname "$0")" || exit 1

echo -e "${BLUE}📦 开始构建所有包...${NC}\n"

# 构建核心包（最重要）
echo -e "${YELLOW}[1/8] 构建 @ldesign/crypto-core...${NC}"
cd packages/core || exit 1
TOTAL_PACKAGES=$((TOTAL_PACKAGES + 1))

if pnpm build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ core 构建成功${NC}"
    SUCCESS_PACKAGES=$((SUCCESS_PACKAGES + 1))
    
    # 检查输出文件
    if [ -d "es" ] && [ -d "lib" ]; then
        echo -e "  ${GREEN}✓ 输出目录: es/ lib/ dist/${NC}"
    fi
else
    echo -e "${RED}✗ core 构建失败${NC}"
    FAILED_PACKAGES+=("core")
fi

cd ../..

# 构建 Vue 包
echo -e "\n${YELLOW}[2/8] 构建 @ldesign/crypto-vue...${NC}"
cd packages/vue || exit 1
TOTAL_PACKAGES=$((TOTAL_PACKAGES + 1))

if pnpm build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ vue 构建成功${NC}"
    SUCCESS_PACKAGES=$((SUCCESS_PACKAGES + 1))
else
    echo -e "${RED}✗ vue 构建失败${NC}"
    FAILED_PACKAGES+=("vue")
fi

cd ../..

# 构建 React 包
echo -e "\n${YELLOW}[3/8] 构建 @ldesign/crypto-react...${NC}"
cd packages/react || exit 1
TOTAL_PACKAGES=$((TOTAL_PACKAGES + 1))

if pnpm build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ react 构建成功${NC}"
    SUCCESS_PACKAGES=$((SUCCESS_PACKAGES + 1))
else
    echo -e "${RED}✗ react 构建失败${NC}"
    FAILED_PACKAGES+=("react")
fi

cd ../..

# 构建 Solid 包
echo -e "\n${YELLOW}[4/8] 构建 @ldesign/crypto-solid...${NC}"
cd packages/solid || exit 1
TOTAL_PACKAGES=$((TOTAL_PACKAGES + 1))

if pnpm build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ solid 构建成功${NC}"
    SUCCESS_PACKAGES=$((SUCCESS_PACKAGES + 1))
else
    echo -e "${RED}✗ solid 构建失败${NC}"
    FAILED_PACKAGES+=("solid")
fi

cd ../..

# 构建 Svelte 包
echo -e "\n${YELLOW}[5/8] 构建 @ldesign/crypto-svelte...${NC}"
cd packages/svelte || exit 1
TOTAL_PACKAGES=$((TOTAL_PACKAGES + 1))

if pnpm build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ svelte 构建成功${NC}"
    SUCCESS_PACKAGES=$((SUCCESS_PACKAGES + 1))
else
    echo -e "${RED}✗ svelte 构建失败${NC}"
    FAILED_PACKAGES+=("svelte")
fi

cd ../..

# 构建 Angular 包
echo -e "\n${YELLOW}[6/8] 构建 @ldesign/crypto-angular...${NC}"
cd packages/angular || exit 1
TOTAL_PACKAGES=$((TOTAL_PACKAGES + 1))

if pnpm build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ angular 构建成功${NC}"
    SUCCESS_PACKAGES=$((SUCCESS_PACKAGES + 1))
else
    echo -e "${RED}✗ angular 构建失败${NC}"
    FAILED_PACKAGES+=("angular")
fi

cd ../..

# 构建 Utils 包
echo -e "\n${YELLOW}[7/8] 构建 @ldesign/crypto-utils...${NC}"
cd packages/utils || exit 1
TOTAL_PACKAGES=$((TOTAL_PACKAGES + 1))

if pnpm build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ utils 构建成功${NC}"
    SUCCESS_PACKAGES=$((SUCCESS_PACKAGES + 1))
else
    echo -e "${RED}✗ utils 构建失败（可能缺少源代码）${NC}"
    FAILED_PACKAGES+=("utils")
fi

cd ../..

# 构建 Stream 包
echo -e "\n${YELLOW}[8/8] 构建 @ldesign/crypto-stream...${NC}"
cd packages/stream || exit 1
TOTAL_PACKAGES=$((TOTAL_PACKAGES + 1))

if pnpm build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ stream 构建成功${NC}"
    SUCCESS_PACKAGES=$((SUCCESS_PACKAGES + 1))
else
    echo -e "${RED}✗ stream 构建失败（可能缺少源代码）${NC}"
    FAILED_PACKAGES+=("stream")
fi

cd ../..

# 运行测试
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}🧪 运行测试...${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Core 包测试
echo -e "${YELLOW}测试 @ldesign/crypto-core...${NC}"
cd packages/core || exit 1
if pnpm test:run > /dev/null 2>&1; then
    echo -e "${GREEN}✓ core 测试通过${NC}"
else
    echo -e "${RED}✗ core 测试失败${NC}"
fi

cd ../..

# Vue 包测试
echo -e "\n${YELLOW}测试 @ldesign/crypto-vue...${NC}"
cd packages/vue || exit 1
if pnpm test:run > /dev/null 2>&1; then
    echo -e "${GREEN}✓ vue 测试通过${NC}"
else
    echo -e "${RED}✗ vue 测试失败${NC}"
fi

cd ../..

# 计算耗时
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# 输出总结
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}📊 构建总结${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "总包数: ${TOTAL_PACKAGES}"
echo -e "${GREEN}成功: ${SUCCESS_PACKAGES}${NC}"
echo -e "${RED}失败: $((TOTAL_PACKAGES - SUCCESS_PACKAGES))${NC}"

if [ ${#FAILED_PACKAGES[@]} -gt 0 ]; then
    echo -e "\n${RED}失败的包:${NC}"
    for pkg in "${FAILED_PACKAGES[@]}"; do
        echo -e "  - ${pkg}"
    done
fi

echo -e "\n⏱️  总耗时: ${DURATION}s"

if [ $SUCCESS_PACKAGES -eq $TOTAL_PACKAGES ]; then
    echo -e "\n${GREEN}🎉 所有包构建成功！${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  部分包构建失败，请检查错误信息${NC}"
    exit 1
fi

